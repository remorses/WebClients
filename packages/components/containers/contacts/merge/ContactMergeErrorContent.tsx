import { c } from 'ttag';

import { Alert, Button, Icon, ModalTwoContent, ModalTwoFooter, ModalTwoHeader } from '../../../components';

interface Props {
    model: {
        errorOnMerge?: boolean;
        errorOnLoad?: boolean;
    };
    onClose?: () => void;
}

const ContactMergeErrorContent = ({ model, onClose }: Props) => {
    const error = model.errorOnLoad
        ? c('Warning').t`Some of the contacts to be merged display errors. Please review them individually`
        : c('Warning').t`Contacts could not be merged`;

    return (
        <>
            <ModalTwoHeader title={c('Title').t`Contact Details`} />
            <ModalTwoContent>
                <Alert type="warning">
                    <Icon name="exclamation-circle" className="mr1" />
                    <span className="mr1">{error}</span>
                </Alert>
            </ModalTwoContent>
            <ModalTwoFooter>
                <Button onClick={onClose}>{c('Action').t`Cancel`}</Button>
            </ModalTwoFooter>
        </>
    );
};

export default ContactMergeErrorContent;
