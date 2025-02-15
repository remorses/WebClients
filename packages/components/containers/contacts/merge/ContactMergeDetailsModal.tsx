import { useEffect, useMemo, useState } from 'react';

import { c } from 'ttag';

import { getContact } from '@proton/shared/lib/api/contacts';
import { CRYPTO_PROCESSING_TYPES } from '@proton/shared/lib/contacts/constants';
import { CryptoProcessingError, prepareVCardContact } from '@proton/shared/lib/contacts/decrypt';
import { toMap } from '@proton/shared/lib/helpers/object';
import { VCardContact } from '@proton/shared/lib/interfaces/contacts/VCard';
import { splitKeys } from '@proton/shared/lib/keys/keys';
import noop from '@proton/utils/noop';

import {
    Button,
    Loader,
    ModalProps,
    ModalTwo,
    ModalTwoContent,
    ModalTwoFooter,
    ModalTwoHeader,
} from '../../../components';
import { useAddresses, useApi, useContactEmails, useContactGroups, useLoading, useUserKeys } from '../../../hooks';
import ContactView from '../view/ContactView';

export interface ContactMergeDetailsModalProps {
    contactID: string;
}

type Props = ContactMergeDetailsModalProps & ModalProps;

const ContactMergeDetailsModal = ({ contactID, ...rest }: Props) => {
    const api = useApi();
    const [userKeysList] = useUserKeys();
    const [loading, withLoading] = useLoading(true);
    const [model, setModel] = useState<{
        vCardContact: VCardContact;
        errors: (CryptoProcessingError | Error)[];
    }>({
        vCardContact: { fn: [] },
        errors: [],
    });

    const [contactEmails, loadingContactEmails] = useContactEmails();

    const [addresses = [], loadingAddresses] = useAddresses();
    const ownAddresses = useMemo(() => addresses.map(({ Email }) => Email), [addresses]);

    const [contactGroups = [], loadingContactGroups] = useContactGroups();
    const contactGroupsMap = useMemo(() => toMap(contactGroups), [contactGroups]);

    useEffect(() => {
        const request = async () => {
            const { Contact } = await api(getContact(contactID));
            const keys = splitKeys(userKeysList);
            const { vCardContact, errors } = await prepareVCardContact(Contact, keys);
            setModel({ vCardContact, errors });
        };

        try {
            void withLoading(request());
        } catch (error: any) {
            setModel({ ...model, errors: [{ type: CRYPTO_PROCESSING_TYPES.FAIL_TO_LOAD, error }] });
        }
    }, []);

    return (
        <ModalTwo size="large" className="contacts-modal" {...rest}>
            <ModalTwoHeader title={c('Title').t`Contact Details`} />
            <ModalTwoContent>
                {loading || loadingContactEmails || loadingAddresses || loadingContactGroups ? (
                    <Loader />
                ) : (
                    <ContactView
                        vCardContact={model.vCardContact}
                        errors={model.errors}
                        contactID={contactID}
                        onDelete={noop}
                        isPreview
                        contactEmails={contactEmails}
                        contactGroupsMap={contactGroupsMap}
                        ownAddresses={ownAddresses}
                        onReload={noop}
                        onEdit={noop}
                        onExport={noop}
                        onEmailSettings={noop}
                        onGroupDetails={noop}
                        onGroupEdit={noop}
                        onUpgrade={noop}
                        onSignatureError={noop}
                        onDecryptionError={noop}
                    />
                )}
            </ModalTwoContent>
            <ModalTwoFooter>
                <Button color="norm" className="mlauto" onClick={rest.onClose}>{c('Action').t`Close`}</Button>
            </ModalTwoFooter>
        </ModalTwo>
    );
};

export default ContactMergeDetailsModal;
