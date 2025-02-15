import { useState } from 'react';

import { c } from 'ttag';

import { PASSWORD_WRONG_ERROR } from '@proton/shared/lib/api/auth';
import { getApiError } from '@proton/shared/lib/api/helpers/apiErrorHelper';
import { SrpConfig, srpAuth } from '@proton/shared/lib/srp';
import noop from '@proton/utils/noop';

import {
    Button,
    Form,
    Loader,
    ModalTwo as Modal,
    ModalTwoContent as ModalContent,
    ModalTwoFooter as ModalFooter,
    ModalTwoHeader as ModalHeader,
    ModalProps,
} from '../../components';
import { useApi } from '../../hooks';
import PasswordTotpInputs from './PasswordTotpInputs';
import useAskAuth from './useAskAuth';

interface Props<T> extends Omit<ModalProps<typeof Form>, 'as' | 'onSubmit' | 'size' | 'onSuccess' | 'onError'> {
    config: SrpConfig;
    onSuccess: (data: { password: string; totp: string; result: T }) => void;
}

const AuthModal = <T,>({ config, onSuccess, onClose, ...rest }: Props<T>) => {
    const api = useApi();
    const [submitting, setSubmitting] = useState(false);

    const [password, setPassword] = useState('');
    const [totp, setTotp] = useState('');
    const [hasTOTPEnabled, isLoadingAuth] = useAskAuth();

    const handleSubmit = async ({ password, totp }: { password: string; totp: string }) => {
        try {
            setSubmitting(true);

            const result = await srpAuth<T>({
                api,
                credentials: { password, totp },
                config,
            });

            onSuccess({ password, totp, result });
            onClose?.();
        } catch (error: any) {
            setSubmitting(false);
            const { code } = getApiError(error);
            if (code !== PASSWORD_WRONG_ERROR) {
                onClose?.();
            }
        }
    };

    const loading = submitting || isLoadingAuth;

    // Don't allow to close this modal if it's loading as it could leave other consumers in an undefined state
    const handleClose = loading ? noop : onClose;

    return (
        <Modal {...rest} size="small" as={Form} onSubmit={() => handleSubmit({ password, totp })} onClose={handleClose}>
            <ModalHeader title={c('Title').t`Sign in again to continue`} />
            <ModalContent>
                {isLoadingAuth ? (
                    <Loader />
                ) : (
                    <PasswordTotpInputs
                        password={password}
                        setPassword={setPassword}
                        totp={totp}
                        setTotp={setTotp}
                        showTotp={hasTOTPEnabled}
                    />
                )}
            </ModalContent>
            <ModalFooter>
                <Button onClick={handleClose} disabled={loading}>{c('Action').t`Cancel`}</Button>
                <Button color="norm" type="submit" disabled={isLoadingAuth} loading={submitting}>
                    {c('Action').t`Submit`}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default AuthModal;
