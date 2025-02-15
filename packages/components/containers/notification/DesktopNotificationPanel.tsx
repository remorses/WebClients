import { useState } from 'react';

import { PushNotification } from 'push.js';
import { c } from 'ttag';

import { Status, create, getStatus, request } from '@proton/shared/lib/helpers/desktopNotification';

import { Badge, Button, Field } from '../../components';

const testDefaultNotification = () => {
    return create(c('Info').t`You have a new email`, {
        body: 'Quarterly operations update',
        icon: '/assets/img/notification-badge.gif',
        onClick() {
            window.focus();
        },
    });
};

export interface Props {
    onTest?: () => Promise<PushNotification | undefined>;
    infoURL?: string;
}
const DesktopNotificationPanel = ({ onTest = testDefaultNotification }: Props) => {
    const [status, setStatus] = useState<Status>(getStatus());

    const handleEnable = () => {
        request(
            () => setStatus(getStatus()),
            () => setStatus(getStatus())
        );
    };

    return (
        <>
            <Field className="pt0-5">
                <div className="mb1">
                    <span className="mr0-5">{c('Info').t`Desktop notifications are currently`}</span>
                    {status === Status.GRANTED ? (
                        <Badge type="success" className="m0">{c('Desktop notification status').t`Enabled`}</Badge>
                    ) : (
                        <Badge type="error" className="m0">{c('Desktop notification status').t`Disabled`}</Badge>
                    )}
                </div>
                <div>
                    {status === Status.GRANTED ? (
                        <Button size="small" onClick={onTest}>{c('Action').t`Send test notification`}</Button>
                    ) : status === Status.DEFAULT ? (
                        <Button size="small" onClick={handleEnable}>{c('Action')
                            .t`Enable desktop notification`}</Button>
                    ) : null}
                </div>
            </Field>
        </>
    );
};

export default DesktopNotificationPanel;
