import { useEffect, useRef, useState } from 'react';
import { Route } from 'react-router';
import { Redirect, Switch, useHistory, useLocation } from 'react-router-dom';

import { c } from 'ttag';

import {
    AccountRecoverySection,
    AuthenticatedBugModal,
    AutomaticSubscriptionModal,
    BillingSection,
    CancelSubscriptionSection,
    CreditsSection,
    DeleteSection,
    EmailSubscriptionSection,
    ErrorBoundary,
    FeatureCode,
    GiftCodeSection,
    InvoicesSection,
    LanguageSection,
    MainLogo,
    OpenVPNConfigurationSection,
    OpenVPNCredentialsSection,
    PasswordsSection,
    PaymentMethodsSection,
    PlansSection,
    PrivateAppContainer,
    PrivateHeader,
    PrivateMainSettingsArea,
    ProtonVPNClientsSection,
    Sidebar,
    SidebarList,
    SidebarListItemsWithSubsections,
    SidebarNav,
    StandardErrorPage,
    SubscriptionModalProvider,
    ThemesSection,
    TopBanners,
    Unauthenticated,
    UserDropdown,
    UsernameSection,
    WireGuardConfigurationSection,
    YourPlanSection,
    useActiveBreakpoint,
    useFeatures,
    useModalState,
    useSubscription,
    useToggle,
    useUser,
    useUserSettings,
} from '@proton/components';
import { getIsSectionAvailable } from '@proton/components/containers/layout/helper';
import { BugModalMode } from '@proton/components/containers/support/BugModal';
import LiveChatZendesk, {
    ZendeskRef,
    getIsSelfChat,
    useCanEnableChat,
} from '@proton/components/containers/zendesk/LiveChatZendesk';
import { APPS } from '@proton/shared/lib/constants';
import { localeCode } from '@proton/shared/lib/i18n';
import { locales } from '@proton/shared/lib/i18n/locales';

import TVContainer from './containers/TVContainer';
import VpnSidebarVersion from './containers/VpnSidebarVersion';
import { getRoutes } from './routes';

const vpnZendeskKey = '52184d31-aa98-430f-a86c-b5a93235027a';

const MainContainer = () => {
    useFeatures([FeatureCode.DrivePlan]);

    const [user] = useUser();
    const [subscription, loadingSubscription] = useSubscription();
    const [tagsArray, setTagsArray] = useState<string[]>([]);
    const [userSettings] = useUserSettings();
    const history = useHistory();
    const { state: expanded, toggle: onToggleExpand, set: setExpand } = useToggle();
    const { isNarrow } = useActiveBreakpoint();
    const location = useLocation();
    const [activeSection, setActiveSection] = useState('');
    const zendeskRef = useRef<ZendeskRef>();
    const [showChat, setShowChat] = useState({ autoToggle: false, render: false });
    const routes = getRoutes(user);
    const canEnableChat = useCanEnableChat(user);
    const [authenticatedBugReportMode, setAuthenticatedBugReportMode] = useState<BugModalMode>();
    const [authenticatedBugReportModal, setAuthenticatedBugReportModal, render] = useModalState();

    const openAuthenticatedBugReportModal = (mode: BugModalMode) => {
        setAuthenticatedBugReportMode(mode);
        setAuthenticatedBugReportModal(true);
    };

    useEffect(() => {
        if (loadingSubscription || !canEnableChat) {
            return;
        }
        const subscriptionUserPaid: string[] = subscription?.Plans?.map((plan) => plan.Name) || [];
        setTagsArray(subscriptionUserPaid);
    }, [subscription]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const hasChatRequest = !!searchParams.get('chat');
        const isSelfChat = getIsSelfChat();

        searchParams.delete('chat');
        history.replace({
            search: searchParams.toString(),
        });
        if (hasChatRequest || isSelfChat) {
            if (canEnableChat) {
                setShowChat({ autoToggle: hasChatRequest, render: true });
            } else {
                openAuthenticatedBugReportModal('chat-unavailable');
            }
        }
    }, []);

    useEffect(() => {
        setExpand(false);
    }, [location.pathname, location.hash]);

    const logo = <MainLogo to="/" />;

    const top = <TopBanners />;

    const header = (
        <PrivateHeader
            userDropdown={
                <UserDropdown
                    onOpenChat={
                        canEnableChat
                            ? () => {
                                  setShowChat({ autoToggle: true, render: true });
                                  zendeskRef.current?.toggle();
                              }
                            : undefined
                    }
                />
            }
            logo={logo}
            title={c('Title').t`Settings`}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            isNarrow={isNarrow}
            appsDropdown={null}
        />
    );

    const sidebar = (
        <Sidebar
            logo={logo}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            version={<VpnSidebarVersion />}
            hasAppLinks={false}
        >
            <SidebarNav>
                <SidebarList>
                    <SidebarListItemsWithSubsections
                        list={Object.values(routes)}
                        pathname={location.pathname}
                        activeSection={activeSection}
                    />
                </SidebarList>
            </SidebarNav>
        </Sidebar>
    );
    return (
        <>
            {render && <AuthenticatedBugModal mode={authenticatedBugReportMode} {...authenticatedBugReportModal} />}
            <Switch>
                <Route path="/tv">
                    <Unauthenticated>
                        <TVContainer />
                    </Unauthenticated>
                </Route>
                <Route path="*">
                    <PrivateAppContainer top={top} header={header} sidebar={sidebar}>
                        <Switch>
                            {getIsSectionAvailable(routes.dashboard) && (
                                <Route path={routes.dashboard.to}>
                                    <SubscriptionModalProvider app={APPS.PROTONVPN_SETTINGS}>
                                        <AutomaticSubscriptionModal />
                                        <PrivateMainSettingsArea
                                            setActiveSection={setActiveSection}
                                            config={routes.dashboard}
                                        >
                                            <PlansSection />
                                            <YourPlanSection app={APPS.PROTONVPN_SETTINGS} />
                                            <BillingSection />
                                            <CreditsSection />
                                            <GiftCodeSection />
                                            <CancelSubscriptionSection />
                                        </PrivateMainSettingsArea>
                                    </SubscriptionModalProvider>
                                </Route>
                            )}
                            <Route path={routes.general.to}>
                                <PrivateMainSettingsArea setActiveSection={setActiveSection} config={routes.general}>
                                    <LanguageSection locales={locales} />
                                    <ThemesSection />
                                </PrivateMainSettingsArea>
                            </Route>
                            <Route path={routes.account.to}>
                                <PrivateMainSettingsArea setActiveSection={setActiveSection} config={routes.account}>
                                    <UsernameSection />
                                    <PasswordsSection />
                                    <OpenVPNCredentialsSection />
                                    <AccountRecoverySection />
                                    <EmailSubscriptionSection />
                                    <DeleteSection />
                                </PrivateMainSettingsArea>
                            </Route>
                            <Route path={routes.downloads.to}>
                                <PrivateMainSettingsArea setActiveSection={setActiveSection} config={routes.downloads}>
                                    <ProtonVPNClientsSection />
                                    <OpenVPNConfigurationSection />
                                    <WireGuardConfigurationSection />
                                </PrivateMainSettingsArea>
                            </Route>
                            {getIsSectionAvailable(routes.payments) && (
                                <Route path={routes.payments.to}>
                                    <PrivateMainSettingsArea
                                        setActiveSection={setActiveSection}
                                        config={routes.payments}
                                    >
                                        <PaymentMethodsSection />
                                        <InvoicesSection />
                                    </PrivateMainSettingsArea>
                                </Route>
                            )}
                            <Redirect
                                to={getIsSectionAvailable(routes.dashboard) ? routes.dashboard.to : routes.downloads.to}
                            />
                        </Switch>
                        {showChat.render && canEnableChat ? (
                            <LiveChatZendesk
                                tags={tagsArray}
                                zendeskRef={zendeskRef}
                                zendeskKey={vpnZendeskKey}
                                name={user.DisplayName || user.Name}
                                email={user.Email || userSettings?.Email?.Value || ''}
                                onLoaded={() => {
                                    if (showChat.autoToggle) {
                                        zendeskRef.current?.toggle();
                                    }
                                }}
                                onUnavailable={() => {
                                    openAuthenticatedBugReportModal('chat-no-agents');
                                }}
                                locale={localeCode.replace('_', '-')}
                            />
                        ) : null}
                    </PrivateAppContainer>
                </Route>
            </Switch>
        </>
    );
};

const WrappedMainContainer = () => {
    return (
        <ErrorBoundary component={<StandardErrorPage />}>
            <MainContainer />
        </ErrorBoundary>
    );
};

export default WrappedMainContainer;
