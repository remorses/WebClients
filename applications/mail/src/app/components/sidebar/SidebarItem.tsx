import { ReactNode, memo, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import { c, msgid } from 'ttag';

import {
    HotkeyTuple,
    IconName,
    IconSize,
    SidebarListItem,
    SidebarListItemContent,
    SidebarListItemContentIcon,
    SidebarListItemLink,
    classnames,
    useEventManager,
    useHotkeys,
    useItemsDroppable,
    useLoading,
    useMailSettings,
} from '@proton/components';
import { MAILBOX_LABEL_IDS } from '@proton/shared/lib/constants';
import { wait } from '@proton/shared/lib/helpers/promise';
import isTruthy from '@proton/utils/isTruthy';
import noop from '@proton/utils/noop';

import { LABEL_IDS_TO_HUMAN } from '../../constants';
import { useApplyLabels } from '../../hooks/actions/useApplyLabels';
import { useMoveToFolder } from '../../hooks/actions/useMoveToFolder';
import { useGetElementsFromIDs } from '../../hooks/mailbox/useElements';
import LocationAside from './LocationAside';

const { ALL_MAIL, DRAFTS, ALL_DRAFTS, SENT, ALL_SENT, SCHEDULED } = MAILBOX_LABEL_IDS;

const noDrop: string[] = [ALL_MAIL, DRAFTS, ALL_DRAFTS, SENT, ALL_SENT, SCHEDULED];

const COUNTER_LIMIT = 9999;

const defaultShortcutHandlers: HotkeyTuple[] = [];

interface Props {
    currentLabelID: string;
    labelID: string;
    isFolder: boolean;
    icon?: IconName;
    iconSize?: IconSize;
    text: string;
    shortcutText?: string;
    content?: ReactNode;
    color?: string;
    unreadCount?: number;
    totalMessagesCount?: number;
    shortcutHandlers?: HotkeyTuple[];
    onFocus?: (id: string) => void;
    id?: string;
}

const SidebarItem = ({
    currentLabelID,
    labelID,
    icon,
    iconSize,
    text,
    shortcutText,
    content = text,
    color,
    isFolder,
    unreadCount,
    totalMessagesCount = 0,
    shortcutHandlers = defaultShortcutHandlers,
    onFocus = noop,
    id,
}: Props) => {
    const { call } = useEventManager();
    const history = useHistory();
    const [{ Shortcuts = 0 } = {}] = useMailSettings();
    const getElementsFromIDs = useGetElementsFromIDs();

    const [refreshing, withRefreshing] = useLoading(false);

    const applyLabels = useApplyLabels();
    const { moveToFolder, moveScheduledModal, moveAllModal, moveToSpamModal } = useMoveToFolder();

    const humanID = LABEL_IDS_TO_HUMAN[labelID as MAILBOX_LABEL_IDS]
        ? LABEL_IDS_TO_HUMAN[labelID as MAILBOX_LABEL_IDS]
        : labelID;
    const link = `/${humanID}`;

    const active = labelID === currentLabelID;
    const ariaCurrent = active ? 'page' : undefined;

    const canDisplayTotalMessagesCounter = labelID === SCHEDULED && totalMessagesCount > 0;

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (
            history.location.pathname.endsWith(link) &&
            // No search, no paging, nothing
            history.location.hash === '' &&
            // Not already refreshing
            !refreshing
        ) {
            event.preventDefault();
            void withRefreshing(Promise.all([call(), wait(1000)]));
        }
    };

    const { dragOver, dragProps, handleDrop } = useItemsDroppable(
        () =>
            currentLabelID !== labelID && // Never on current label
            !noDrop.includes(labelID), // Some destinations has no sense
        isFolder ? 'move' : 'link',
        (itemIDs) => {
            const elements = getElementsFromIDs(itemIDs);
            if (isFolder) {
                void moveToFolder(elements, labelID, text, currentLabelID, false);
            } else {
                void applyLabels(elements, { [labelID]: true }, false);
            }
        }
    );

    const elementRef = useRef<HTMLAnchorElement>(null);
    useHotkeys(elementRef, shortcutHandlers);

    const getTotalMessagesTitle = () => {
        return c('Info').ngettext(
            msgid`${totalMessagesCount} scheduled message`,
            `${totalMessagesCount} scheduled messages`,
            totalMessagesCount
        );
    };

    const totalMessagesCounter = canDisplayTotalMessagesCounter && (
        <span
            className="navigation-counter-item navigation-counter-item--transparent flex-item-noshrink color-weak text-sm"
            title={getTotalMessagesTitle()}
            data-testid="navigation-link:total-messages-count"
        >
            {totalMessagesCount > COUNTER_LIMIT ? '9999+' : totalMessagesCount}
        </span>
    );

    return (
        <SidebarListItem className={classnames([dragOver && 'navigation__dragover'])}>
            <SidebarListItemLink
                aria-current={ariaCurrent}
                to={link}
                onClick={handleClick}
                {...dragProps}
                onDrop={handleDrop}
                title={shortcutText !== undefined && Shortcuts ? `${text} ${shortcutText}` : text}
                ref={elementRef}
                data-testid={`navigation-link:${text}`}
                data-shortcut-target={['navigation-link', id].filter(isTruthy).join(' ')}
                onFocus={() => onFocus(id || '')}
            >
                <SidebarListItemContent
                    left={icon ? <SidebarListItemContentIcon name={icon} color={color} size={iconSize} /> : undefined}
                    right={<LocationAside unreadCount={unreadCount} active={active} refreshing={refreshing} />}
                >
                    <span className="text-ellipsis">{content}</span>
                    {totalMessagesCounter}
                </SidebarListItemContent>
            </SidebarListItemLink>
            {moveScheduledModal}
            {moveAllModal}
            {moveToSpamModal}
        </SidebarListItem>
    );
};

export default memo(SidebarItem);
