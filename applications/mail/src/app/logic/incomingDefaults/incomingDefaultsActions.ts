import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import {
    addIncomingDefault,
    deleteIncomingDefaults,
    getIncomingDefaults,
    updateIncomingDefault,
} from '@proton/shared/lib/api/incomingDefaults';
import { INCOMING_DEFAULTS_LOCATION } from '@proton/shared/lib/constants';
import { Api, IncomingDefault } from '@proton/shared/lib/interfaces';

import { IncomingDefaultEvent } from '../../models/event';
import { IncomingDefaultsState } from './incomingDefaultsTypes';

type LoadResults = Pick<IncomingDefaultsState, 'list'>;

interface LoadParams {
    api: Api;
}

interface ApiResult {
    IncomingDefaults: IncomingDefault[];
    Total: number;
    GlobalTotal: number;
}

const LOAD_BY_CHUNKS_SIZE = 100;
export const load = createAsyncThunk<LoadResults, LoadParams>('incomingDefaults/load', async ({ api }) => {
    const list: IncomingDefault[] = [];
    let count = 0;
    let page = 0;

    do {
        try {
            const result = await api<ApiResult>(
                getIncomingDefaults({
                    Page: page,
                    PageSize: LOAD_BY_CHUNKS_SIZE,
                    // Load only the blocked ones for perf reasons
                    Location: INCOMING_DEFAULTS_LOCATION.BLOCKED,
                })
            );
            list.push(...result.IncomingDefaults);
            count = result.Total;
            page += 1;
        } catch (error: any | undefined) {
            console.error(error);
            throw error;
        }
    } while (count > list.length);

    return {
        list,
        count,
    };
});

export const event = createAction<IncomingDefaultEvent>('incomingDefaults/event');

interface BlockParams {
    api: Api;
    address: string;
    ID?: string;
    type: 'create' | 'update';
}

export const blockAddress = createAsyncThunk<IncomingDefault, BlockParams>(
    'incomingDefaults/blockAddress',
    async ({ api, address, ID, type }) => {
        try {
            const result = await api<{ IncomingDefault: IncomingDefault }>(
                type === 'update' && ID
                    ? updateIncomingDefault(ID, { Email: address, Location: INCOMING_DEFAULTS_LOCATION.BLOCKED })
                    : addIncomingDefault({ Email: address, Location: INCOMING_DEFAULTS_LOCATION.BLOCKED })
            );

            return result.IncomingDefault;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
);

export const remove = createAsyncThunk<
    { ID: string }[],
    {
        api: Api;
        ID: string;
    }
>('incomingDefaults/remove', async ({ api, ID }) => {
    try {
        const result = await api<{ Responses: { ID: string }[] }>(deleteIncomingDefaults([ID]));

        return result.Responses;
    } catch (error) {
        console.log(error);
        throw error;
    }
});
