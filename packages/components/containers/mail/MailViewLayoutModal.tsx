import { c } from 'ttag';

import { updateViewLayout } from '@proton/shared/lib/api/mailSettings';
import { VIEW_LAYOUT } from '@proton/shared/lib/constants';

import { Button, ModalProps, ModalTwo, ModalTwoContent, ModalTwoFooter, ModalTwoHeader } from '../../components';
import { useApi, useEventManager, useLoading, useMailSettings, useNotifications } from '../../hooks';
import ViewLayoutCards from '../layouts/ViewLayoutCards';

import './ModalSettingsLayoutCards.scss';

const MailViewLayoutModal = (props: ModalProps) => {
    const api = useApi();
    const { call } = useEventManager();
    const [{ ViewLayout = 0 } = {}] = useMailSettings();
    const [loading, withLoading] = useLoading();
    const { createNotification } = useNotifications();
    const title = c('Title').t`Mailbox layout`;

    const { onClose } = props;

    const handleChangeViewLayout = async (layout: VIEW_LAYOUT) => {
        await api(updateViewLayout(layout));
        await call();
        createNotification({ text: c('Success').t`Preference saved` });
    };

    const handleSubmit = () => onClose?.();

    return (
        <ModalTwo {...props}>
            <ModalTwoHeader title={title} />
            <ModalTwoContent>
                <div className="flex flex-nowrap mb1 on-mobile-flex-column flex-column">
                    <span className="mb1" id="layoutMode_desc">
                        {c('Label').t`Select how your mailbox looks like by default.`}
                    </span>
                    <ViewLayoutCards
                        describedByID="layoutMode_desc"
                        viewLayout={ViewLayout}
                        onChange={(value) => withLoading(handleChangeViewLayout(value))}
                        loading={loading}
                        liClassName="w100"
                        className="layoutCards-two-per-row"
                    />
                </div>
            </ModalTwoContent>
            <ModalTwoFooter>
                <Button className="mlauto" color="norm" onClick={handleSubmit}>{c('Action').t`OK`}</Button>
            </ModalTwoFooter>
        </ModalTwo>
    );
};

export default MailViewLayoutModal;
