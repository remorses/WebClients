import { c } from 'ttag';

import { updateComposerMode } from '@proton/shared/lib/api/mailSettings';
import { COMPOSER_MODE } from '@proton/shared/lib/constants';

import { Button, ModalProps, ModalTwo, ModalTwoContent, ModalTwoFooter, ModalTwoHeader } from '../../components';
import { useApi, useEventManager, useLoading, useMailSettings, useNotifications } from '../../hooks';
import ComposerModeCards from '../layouts/ComposerModeCards';

import './ModalSettingsLayoutCards.scss';

const MailComposerModeModal = (props: ModalProps) => {
    const api = useApi();
    const { call } = useEventManager();
    const [{ ComposerMode = 0 } = {}] = useMailSettings();
    const [loading, withLoading] = useLoading();
    const { createNotification } = useNotifications();
    const title = c('Title').t`Composer mode`;

    const { onClose } = props;

    const handleChangeComposerMode = async (mode: COMPOSER_MODE) => {
        await api(updateComposerMode(mode));
        await call();
        createNotification({ text: c('Success').t`Preference saved` });
    };

    const handleSubmit = () => onClose?.();

    return (
        <ModalTwo {...props}>
            <ModalTwoHeader title={title} />
            <ModalTwoContent>
                <div className="flex flex-nowrap mb1 on-mobile-flex-column flex-column">
                    <span className="mb1" id="composerMode_desc">
                        {c('Label').t`Select how your composer opens by default.`}
                    </span>
                    <ComposerModeCards
                        describedByID="composerMode_desc"
                        composerMode={ComposerMode}
                        onChange={(value) => withLoading(handleChangeComposerMode(value))}
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

export default MailComposerModeModal;
