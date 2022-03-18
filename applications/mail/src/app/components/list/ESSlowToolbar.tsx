import { memo, useMemo } from 'react';
import { c } from 'ttag';
import { Icon, InlineLinkButton, useUser } from '@proton/components';
import { sendSlowSearchReport } from '@proton/encrypted-search';
import { useEncryptedSearchContext } from '../../containers/EncryptedSearchProvider';
import { storeName } from '../../constants';

const ESSlowToolbar = () => {
    const [{ ID: userID }] = useUser();
    const { openDropdown, setTemporaryToggleOff } = useEncryptedSearchContext();

    useMemo(() => {
        void sendSlowSearchReport(userID, storeName);
    }, []);

    const dropdownButton = (
        <InlineLinkButton className="pl0-25 pr0-25" onClick={openDropdown} key="dropdownButton">
            {
                // translator: sentence appears when a message content search takes too long . Complete sentence example: "Search taking too long? <Refine it> or <exclude message content> from this search session.
                c('Action').t`Refine it`
            }
        </InlineLinkButton>
    );
    const toggleOffButton = (
        <InlineLinkButton className="pl0-25 pr0-25" onClick={setTemporaryToggleOff} key="toggleOffButton">
            {
                // translator: sentence appears when a message content search takes too long . Complete sentence example: "Search taking too long? <Refine it> or <exclude message content> from this search session.
                c('Action').t`exclude message content`
            }
        </InlineLinkButton>
    );

    return (
        <div className="bg-weak rounded m1 px1 py0-5 flex flex-wrap flex-justify-start flex-align-items-center">
            <Icon name="magnifying-glass" className="mr0-5" />
            {
                // translator: sentence appears when a message content search takes too long . Complete sentence example: "Search taking too long? <Refine it> or <exclude message content> from this search session.
                c('Info').jt`Search taking too long? ${dropdownButton} or ${toggleOffButton} from this search session.`
            }
        </div>
    );
};

export default memo(ESSlowToolbar);
