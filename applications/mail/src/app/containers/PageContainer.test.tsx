import { fireEvent } from '@testing-library/dom';
import { clearAll, render, addApiMock, assertFocus, minimalCache, addToCache, onCompose } from '../helpers/test/helper';
import { Breakpoints } from '../models/utils';
import PageContainer from './PageContainer';

jest.setTimeout(20000);

describe('PageContainer', () => {
    const props = {
        breakpoints: {} as Breakpoints,
        isComposerOpened: false,
    };

    beforeEach(clearAll);

    const setup = async ({ Component = PageContainer } = {}) => {
        addApiMock('importer/v1/importers', () => ({ Importers: [] }));
        addApiMock('settings/calendar', () => ({}));
        addApiMock('calendar/v1', () => ({}));
        addApiMock('payments/plans', () => ({}));
        addApiMock('mail/v4/conversations', () => ({}));

        minimalCache();
        addToCache('MailSettings', { Shortcuts: 1 });

        const renderResult = await render(<Component {...props} />, false);
        const { container } = renderResult;
        return {
            ...renderResult,
            questionMark: () => fireEvent.keyDown(container, { key: '?' }),
            tab: () => fireEvent.keyDown(container, { key: 'Tab' }),
            slash: () => fireEvent.keyDown(container, { key: '/' }),
            n: () => fireEvent.keyDown(container, { key: 'N' }),
        };
    };

    describe('hotkeys', () => {
        it('should open hotkeys modal on ?', async () => {
            const { questionMark, getByText } = await setup();

            questionMark();

            getByText('ProtonMail Keyboard Shortcuts');
        });

        it('should focus element list on Tab', async () => {
            const Component = () => {
                return (
                    <>
                        <PageContainer {...props} />
                        <div data-shortcut-target="item-container" tabIndex={-1} />
                    </>
                );
            };

            const { tab } = await setup({ Component: Component as any });

            tab();

            const itemContainer = document.querySelector('[data-shortcut-target="item-container"]');

            assertFocus(itemContainer);
        });

        it('should focus search bar on /', async () => {
            const { slash } = await setup();

            slash();

            const search = document.querySelector('[data-shorcut-target="searchbox-field"]');

            assertFocus(search);
        });

        it('should open composer on a N', async () => {
            const { n } = await setup();

            n();

            expect(onCompose).toHaveBeenCalled();
        });
    });
});
