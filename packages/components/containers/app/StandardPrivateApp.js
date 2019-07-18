import React, { useState, useRef, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';
import {
    EventManagerProvider,
    ForceRefreshProvider,
    Loader,
    ModalsChildren,
    ThemeInjector,
    LocaleInjector,
    useApi,
    useCache
} from 'react-components';
import { UserModel, UserSettingsModel } from 'proton-shared/lib/models';

import { createEventManager, loadModels } from 'proton-shared/lib/models/helper';
import { loadOpenPGP } from 'proton-shared/lib/openpgp';
import { loadLocale } from 'proton-shared/lib/i18n';
import { uniqueBy } from 'proton-shared/lib/helpers/array';

const Preload = ({ locales, preloadModels, eventModels, onSuccess, onError }) => {
    const api = useApi();
    const cache = useCache();

    useLayoutEffect(() => {
        (async () => {
            const [[userSettings], ev] = await Promise.all([
                loadModels(uniqueBy([UserSettingsModel, UserModel, ...preloadModels], (x) => x), { api, cache }),
                createEventManager(eventModels, { api, cache }),
                loadOpenPGP()
            ]);
            await loadLocale(userSettings.Locale, locales);
            return ev;
        })()
            .then(onSuccess)
            .catch(onError);
    }, []);

    return null;
};

const StandardPrivateApp = ({ onLogout, locales, preloadModels, eventModels, children }) => {
    const [loading, setLoading] = useState(true);
    const eventManagerRef = useRef();
    const refreshRef = useRef();

    if (loading) {
        return (
            <>
                <Preload
                    eventModels={eventModels}
                    preloadModels={preloadModels}
                    locales={locales}
                    onSuccess={(ev) => {
                        eventManagerRef.current = ev;
                        setLoading(false);
                    }}
                    onError={onLogout}
                />
                <ModalsChildren />
                <Loader />
            </>
        );
    }

    return (
        <Router>
            <EventManagerProvider eventManager={eventManagerRef.current}>
                <ThemeInjector />
                <LocaleInjector locales={locales} refresh={refreshRef} />
                <ForceRefreshProvider ref={refreshRef}>
                    <ModalsChildren />
                    {children}
                </ForceRefreshProvider>
            </EventManagerProvider>
        </Router>
    );
};

StandardPrivateApp.propTypes = {
    onLogout: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    locales: PropTypes.object,
    preloadModels: PropTypes.array,
    eventModels: PropTypes.array
};

StandardPrivateApp.defaultProps = {
    locales: {},
    preloadModels: [],
    eventModels: []
};

export default StandardPrivateApp;
