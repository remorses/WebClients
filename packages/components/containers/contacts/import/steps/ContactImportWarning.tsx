import { Dispatch, FormEvent, SetStateAction } from 'react';

import { c } from 'ttag';

import { IMPORT_STEPS, ImportContactsModel } from '@proton/shared/lib/interfaces/contacts/Import';

import { Alert, Button, ModalTwoContent, ModalTwoFooter, ModalTwoHeader } from '../../../../components';
import ErrorDetails from './ContactImportWarningErrorDetails';

interface Props {
    model: ImportContactsModel;
    setModel: Dispatch<SetStateAction<ImportContactsModel>>;
    onClose?: () => void;
}

const ContactImportWarning = ({ model, setModel, onClose }: Props) => {
    const contactsDiscarded = model.errors;
    const totalSupported = model.parsedVcardContacts.length;
    const totalContactsDiscarded = contactsDiscarded.length;
    const totalContacts = totalSupported + totalContactsDiscarded;

    const forNow = <strong key="for-now">{c('Import contacts warning').t`for now`}</strong>;
    const summary =
        totalContactsDiscarded === totalContacts
            ? c('Import warning').t`No contact can be imported. Click for details`
            : c('Import warning')
                  .t`${totalContactsDiscarded} out of ${totalContacts} contacts will not be imported. Click for details`;

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        setModel({ ...model, step: IMPORT_STEPS.IMPORTING, errors: [] });
    };

    return (
        <form className="modal-two-dialog-container h100" onSubmit={handleSubmit}>
            <ModalTwoHeader title={c('Title').t`Warning`} />
            <ModalTwoContent>
                <Alert className="mb1" type="warning">
                    <div>{c('Import contacts warning').jt`ProtonContacts does not support ${forNow}:`}</div>
                    <ul>
                        <li>{c('Import calendar warning').t`vCard versions < 3.0`}</li>
                    </ul>
                </Alert>
                <ErrorDetails summary={summary} errors={model.errors} />
            </ModalTwoContent>
            <ModalTwoFooter>
                <Button onClick={onClose}>{c('Action').t`Cancel`}</Button>
                <Button color="norm" disabled={!model.parsedVcardContacts?.length} type="submit">
                    {c('Action').t`Import`}
                </Button>
            </ModalTwoFooter>
        </form>
    );
};

export default ContactImportWarning;
