import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RouteComponentProps, useLocation } from 'react-router-dom';

import { FilePreview, NavigationControl, useModals } from '@proton/components';
import { HTTP_STATUS_CODE } from '@proton/shared/lib/constants';
import { RESPONSE_CODE } from '@proton/shared/lib/drive/constants';

import DetailsModal from '../components/DetailsModal';
import ShareLinkModal from '../components/ShareLinkModal/ShareLinkModal';
import { SignatureAlertBody } from '../components/SignatureAlert';
import SignatureIcon from '../components/SignatureIcon';
import useActiveShare from '../hooks/drive/useActiveShare';
import useNavigate from '../hooks/drive/useNavigate';
import { DecryptedLink, useFileView } from '../store';
// TODO: ideally not use here
import useSearchResults from '../store/_search/useSearchResults';

const getSharedStatus = (link?: DecryptedLink) => {
    if (!link?.isShared) {
        return '';
    }
    if (link?.shareUrl?.isExpired || link?.trashed) {
        return 'inactive';
    }
    return 'shared';
};

export default function PreviewContainer({ match }: RouteComponentProps<{ shareId: string; linkId: string }>) {
    const { shareId, linkId } = match.params;
    const { navigateToLink, navigateToSharedURLs, navigateToTrash, navigateToRoot, navigateToSearch } = useNavigate();
    const { setFolder } = useActiveShare();
    const [, setError] = useState();
    const { createModal, removeModal } = useModals();
    const { query: lastQuery } = useSearchResults();

    const referer = new URLSearchParams(useLocation().search).get('r');
    const useNavigation =
        !referer?.startsWith('/shared-urls') && !referer?.startsWith('/trash') && !referer?.startsWith('/search');

    const { isLoading, error, link, contents, saveFile, navigation } = useFileView(shareId, linkId, useNavigation);

    // If the link is not type of file, probably user modified the URL.
    useEffect(() => {
        if (link && !link.isFile) {
            navigateToLink(shareId, linkId, false);
        }
    }, [link?.isFile]);

    useEffect(() => {
        if (link) {
            setFolder({ shareId, linkId: link.parentLinkId });
        }
    }, [shareId, link?.parentLinkId]);

    useEffect(() => {
        if (error) {
            if (
                // Block not found (storage response).
                error.status === HTTP_STATUS_CODE.NOT_FOUND ||
                // Meta data not found (API response).
                error.data?.Code === RESPONSE_CODE.NOT_FOUND ||
                error.data?.Code === RESPONSE_CODE.INVALID_ID
            ) {
                navigateToRoot();
            } else {
                setError(() => {
                    throw error;
                });
            }
        }
    }, [error]);

    const navigateToParent = useCallback(() => {
        if (referer?.startsWith('/shared-urls')) {
            navigateToSharedURLs();
            return;
        }
        if (referer?.startsWith('/trash')) {
            navigateToTrash();
            return;
        }
        if (referer?.startsWith('/search')) {
            if (lastQuery) {
                navigateToSearch(lastQuery);
                return;
            }
        }
        if (link?.parentLinkId) {
            navigateToLink(shareId, link.parentLinkId, false);
        }
    }, [link?.parentLinkId, shareId, referer]);

    const onOpen = useCallback(
        (linkId: string | undefined) => {
            if (linkId) {
                navigateToLink(shareId, linkId, true);
            }
        },
        [shareId]
    );

    // Remember modal ID created by preview and close it together
    // with closing the preview itself.
    const modalId = useRef<string>();
    useEffect(() => {
        return () => {
            if (modalId.current) {
                removeModal(modalId.current);
            }
        };
    }, []);

    const openDetails = useCallback(() => {
        createModal(<DetailsModal shareId={shareId} linkId={linkId} />);
    }, [shareId, linkId]);

    const openShareOptions = useCallback(() => {
        createModal(<ShareLinkModal shareId={shareId} linkId={linkId} />);
    }, [shareId, linkId]);

    const signatureStatus = useMemo(() => {
        if (!link) {
            return;
        }

        return (
            <SignatureIcon isFile={link.isFile} signatureIssues={link.signatureIssues} className="ml0-5 color-danger" />
        );
    }, [link]);

    const signatureConfirmation = useMemo(() => {
        if (!link?.signatureIssues?.blocks) {
            return;
        }

        return (
            <SignatureAlertBody
                signatureIssues={link.signatureIssues}
                signatureAddress={link.signatureAddress}
                isFile={link.isFile}
                name={link.name}
            />
        );
    }, [link]);

    const rootRef = useRef<HTMLDivElement>(null);

    return (
        <FilePreview
            loading={isLoading}
            contents={contents}
            fileName={link?.name}
            mimeType={link?.mimeType}
            sharedStatus={getSharedStatus(link)}
            fileSize={link?.size}
            onClose={navigateToParent}
            onSave={saveFile}
            onDetail={openDetails}
            onShare={openShareOptions}
            ref={rootRef}
            navigationControls={
                link &&
                navigation && (
                    <NavigationControl
                        current={navigation.current}
                        total={navigation.total}
                        rootRef={rootRef}
                        onPrev={() => onOpen?.(navigation.prevLinkId)}
                        onNext={() => onOpen?.(navigation.nextLinkId)}
                    />
                )
            }
            signatureStatus={signatureStatus}
            signatureConfirmation={signatureConfirmation}
        />
    );
}
