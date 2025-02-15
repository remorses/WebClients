import { ChangeEvent, useEffect, useMemo, useState } from 'react';

import { c } from 'ttag';

import { ADDRESS_STATUS, MAIL_APP_NAME, RECEIVE_ADDRESS, SEND_ADDRESS } from '@proton/shared/lib/constants';
import { Address } from '@proton/shared/lib/interfaces';

import { Info, Loader, Select } from '../../components';
import { useAddresses, useMailSettings, useUserSettings } from '../../hooks';
import { SettingsParagraph, SettingsSectionWide } from '../account';
import SettingsLayout from '../account/SettingsLayout';
import SettingsLayoutLeft from '../account/SettingsLayoutLeft';
import SettingsLayoutRight from '../account/SettingsLayoutRight';
import EditAddressesSection from './EditAddressesSection';
import PMSignature from './PMSignatureField';

const IdentitySection = () => {
    const [addresses, loading] = useAddresses();
    const [mailSettings] = useMailSettings();
    const [userSettings] = useUserSettings();

    const [address, setAddress] = useState<Address>();

    const filtered = useMemo<Address[]>(() => {
        return addresses
            ? addresses.filter(
                  ({ Status, Receive, Send }) =>
                      Status === ADDRESS_STATUS.STATUS_ENABLED &&
                      Receive === RECEIVE_ADDRESS.RECEIVE_YES &&
                      Send === SEND_ADDRESS.SEND_YES
              )
            : [];
    }, [addresses]);

    useEffect(() => {
        if (!address && filtered.length) {
            setAddress(filtered[0]);
        }
    }, [address, filtered]);

    if (!loading && !filtered.length) {
        return <SettingsParagraph>{c('Info').t`No addresses exist`}</SettingsParagraph>;
    }

    const options = filtered.map(({ Email: text }, index) => ({ text, value: index }));

    const handleChange = ({ target }: ChangeEvent<HTMLSelectElement>) => {
        if (filtered) {
            setAddress(filtered[+target.value]);
        }
    };

    return (
        <SettingsSectionWide>
            {loading || !Array.isArray(addresses) ? (
                <Loader />
            ) : (
                <>
                    <SettingsLayout>
                        <SettingsLayoutLeft>
                            <label className="on-mobile-pb0 text-semibold" htmlFor="addressSelector">
                                {c('Label').t`Email address`}
                            </label>
                        </SettingsLayoutLeft>
                        <SettingsLayoutRight className="on-mobile-pb0 flex flex-row flex-nowrap">
                            <Select
                                id="addressSelector"
                                options={options}
                                onChange={handleChange}
                                data-testid="settings:identity-section:address"
                            />
                        </SettingsLayoutRight>
                    </SettingsLayout>

                    {address && <EditAddressesSection address={address} />}

                    <SettingsLayout>
                        <SettingsLayoutLeft>
                            <label
                                htmlFor="pmSignatureToggle"
                                className="text-semibold"
                                data-testid="settings:identity-section:signature-toggle-label"
                            >
                                <span className="mr0-5">{c('Label').t`${MAIL_APP_NAME} footer`}</span>
                                <Info title={c('Info').t`Let your contacts know you care about their privacy.`} />
                            </label>
                        </SettingsLayoutLeft>
                        <SettingsLayoutRight>
                            <PMSignature
                                id="pmSignatureToggle"
                                mailSettings={mailSettings}
                                userSettings={userSettings}
                            />
                        </SettingsLayoutRight>
                    </SettingsLayout>
                </>
            )}
        </SettingsSectionWide>
    );
};

export default IdentitySection;
