import { Fragment } from 'react';

import { c } from 'ttag';

import { Label } from '@proton/shared/lib/interfaces/Label';

import { Button, Checkbox, Icon, LabelStack, useModalState } from '../../../components';
import { classnames } from '../../../helpers';
import EditLabelModal, { LabelModel } from '../../labels/modals/EditLabelModal';
import { Actions } from '../interfaces';

interface Props {
    labels: Label[];
    isNarrow: boolean;
    actions: Actions;
    handleUpdateActions: (onUpdateActions: Partial<Actions>) => void;
}

type ChangePayload = {
    labels: string[];
    isOpen: boolean;
};

const FilterActionsFormLabelsRow = ({ actions, isNarrow, handleUpdateActions, labels }: Props) => {
    const { labelAs } = actions;
    const { isOpen } = labelAs;

    const [editLabelProps, setEditLabelModalOpen] = useModalState();

    const handleChangeModel = (payload: Partial<ChangePayload>) => {
        handleUpdateActions({
            labelAs: {
                ...actions.labelAs,
                ...payload,
            },
        });
    };

    const toggleSection = () => {
        handleChangeModel({ isOpen: !isOpen });
    };

    const handleCreateLabel = (label: LabelModel) => {
        if (label.Path) {
            handleChangeModel({ labels: [...labelAs.labels, label.Path] });
        }
    };

    const handleCheckLabel = (checkedLabel: Label) => {
        const isLabelCheck = labelAs.labels.indexOf(checkedLabel.Path) === -1;

        let nextLabels = [...labelAs.labels];
        nextLabels = isLabelCheck
            ? [...nextLabels, checkedLabel.Path]
            : nextLabels.filter((labelPath) => checkedLabel.Path !== labelPath);

        handleChangeModel({ labels: nextLabels });
    };

    const renderClosed = () => {
        if (!labelAs?.labels.length) {
            return <em>{c('Info').t`No label selected`}</em>;
        }

        return (
            <div>
                {labelAs?.labels.map((labelName: string) => {
                    const label = labels?.find((l) => l.Name === labelName);

                    return label ? (
                        <Fragment key={labelName}>
                            <span className="ml0-5 mr0-5 mb0-5">
                                <LabelStack
                                    labels={[
                                        {
                                            name: label.Name,
                                            color: label.Color,
                                            title: label.Name,
                                        },
                                    ]}
                                />
                            </span>
                        </Fragment>
                    ) : null;
                })}
            </div>
        );
    };

    return (
        <div
            className="border-bottom flex flex-nowrap on-mobile-flex-column align-items-center pt1 pb1"
            data-testid="filter-modal:label-row"
        >
            <button type="button" className={classnames(['w20 text-left', isNarrow && 'mb1'])} onClick={toggleSection}>
                <Icon name="chevron-down" className={classnames([isOpen && 'rotateX-180'])} />
                <span className={classnames(['ml0-5', actions.error && 'color-danger'])}>{c('Label').t`Label as`}</span>
            </button>
            <div className={classnames(['flex-item-fluid', !isNarrow && 'ml1'])}>
                {isOpen ? (
                    <>
                        <div className="w100">
                            {labels.length ? (
                                labels.map((label) => (
                                    <div className="mb0-5 inline-block text-ellipsis" key={label.Path}>
                                        <Checkbox
                                            title={label.Name}
                                            className="mr1 flex-nowrap"
                                            checked={labelAs.labels.includes(label.Path)}
                                            onChange={() => handleCheckLabel(label)}
                                            labelOnClick={(e) => e.stopPropagation()}
                                        >
                                            <span className="inline-flex align-middle">
                                                <LabelStack
                                                    labels={[
                                                        {
                                                            name: label.Name,
                                                            color: label.Color,
                                                        },
                                                    ]}
                                                />
                                            </span>
                                        </Checkbox>
                                    </div>
                                ))
                            ) : (
                                <div className="pt0-5 mb1">{c('Label').t`No label found`}</div>
                            )}
                        </div>
                        <Button shape="outline" className="mt0" onClick={() => setEditLabelModalOpen(true)}>
                            {c('Action').t`Create label`}
                        </Button>
                        <EditLabelModal {...editLabelProps} onAdd={handleCreateLabel} type="label" />
                    </>
                ) : (
                    <div className="mt0-5">{renderClosed()}</div>
                )}
            </div>
        </div>
    );
};
export default FilterActionsFormLabelsRow;
