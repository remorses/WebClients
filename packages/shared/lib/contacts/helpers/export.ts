import { format } from 'date-fns';

import uniqueBy from '@proton/utils/uniqueBy';

import { getContact, queryContactExport } from '../../api/contacts';
import downloadFile from '../../helpers/downloadFile';
import { wait } from '../../helpers/promise';
import { Api, DecryptedKey } from '../../interfaces';
import { Contact, ContactCard } from '../../interfaces/contacts/Contact';
import { VCardContact, VCardProperty } from '../../interfaces/contacts/VCard';
import { splitKeys } from '../../keys';
import { API_SAFE_INTERVAL, QUERY_EXPORT_MAX_PAGESIZE } from '../constants';
import { prepareVCardContact } from '../decrypt';
import { getVCardProperties } from '../properties';
import { vCardPropertiesToICAL } from '../vcard';

export const getFileName = (properties: VCardProperty[]) => {
    const name = properties
        .filter(({ field }) => ['fn', 'email'].includes(field))
        .map(({ value }) => (Array.isArray(value) ? value[0] : value))[0];

    return `${name}-${format(Date.now(), 'yyyy-MM-dd')}.vcf`;
};

/**
 * Export a single contact, given as an array of properties
 * @param {Array} properties
 */
export const singleExport = (vCardContact: VCardContact) => {
    const properties = getVCardProperties(vCardContact);
    const fileName = getFileName(properties);
    const vcard = vCardPropertiesToICAL(properties).toString();
    const blob = new Blob([vcard], { type: 'data:text/plain;charset=utf-8;' });

    downloadFile(blob, fileName);
};

export const exportContact = async (cards: ContactCard[], userKeys: DecryptedKey[]) => {
    const { publicKeys, privateKeys } = splitKeys(userKeys);

    const { vCardContact, errors = [] } = await prepareVCardContact({ Cards: cards } as Contact, {
        publicKeys,
        privateKeys,
    });

    if (errors.length) {
        throw new Error('Error decrypting contact');
    }

    const properties = getVCardProperties(vCardContact);
    const name = getFileName(properties);

    return { name, vcard: vCardPropertiesToICAL(properties).toString() };
};

/**
 * Exports contacts including api request and decryption
 * Beware it requires all contacts in //, don't use this for more than 10 contacts
 */
export const exportContacts = (contactIDs: string[], userKeys: DecryptedKey[], api: Api) =>
    Promise.all(
        contactIDs.map(async (contactID) => {
            const {
                Contact: { Cards },
            } = (await api(getContact(contactID))) as { Contact: Contact };
            return exportContact(Cards, userKeys);
        })
    );

/**
 * Export contacts from a labelID full featured with batch requests, callbacks, abort
 */
export const exportContactsFromLabel = async (
    labelID: string | undefined,
    count: number,
    userKeys: DecryptedKey[],
    signal: AbortSignal,
    api: Api,
    callbackSuccess: (contactContent: string) => void,
    callbackFailure: (contactID: string) => void
) => {
    const apiWithAbort = (config: any) => api({ ...config, signal });
    const apiCalls = Math.ceil(count / QUERY_EXPORT_MAX_PAGESIZE);
    const results = { success: [] as string[], failures: [] as string[] };

    for (let i = 0; i < apiCalls; i++) {
        let { Contacts: contacts } = (await apiWithAbort(
            queryContactExport({ LabelID: labelID, Page: i, PageSize: QUERY_EXPORT_MAX_PAGESIZE })
        )) as { Contacts: Contact[] };

        // API will respond one contact per email (unless fixed in the meantime)
        // We want to export each contact only once
        contacts = uniqueBy(contacts, (contact) => contact.ID);

        for (const { Cards, ID } of contacts) {
            if (signal.aborted) {
                return;
            }
            try {
                const { vcard } = await exportContact(Cards, userKeys);

                // need to check again for signal.aborted because the abort
                // may have taken place during await prepareContact
                if (!signal.aborted) {
                    callbackSuccess(vcard);
                }

                results.success.push(vcard);
            } catch (error: any) {
                // need to check again for signal.aborted because the abort
                // may have taken place during await prepareContact
                if (!signal.aborted) {
                    callbackFailure(ID);
                }

                results.failures.push(ID);
            }
        }

        // avoid overloading API in the unlikely case exportBatch is too fast
        await wait(API_SAFE_INTERVAL);
    }

    return results;
};
