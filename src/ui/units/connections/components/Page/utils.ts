import {ConnectorType} from 'shared';

import {FieldKey, S3_BASED_CONNECTORS} from '../../constants';
import {FormDict} from '../../typings';

export const isS3BasedConnForm = (connectionData: FormDict, paramsType?: string) => {
    const type = (connectionData[FieldKey.DbType] || paramsType) as ConnectorType;
    return S3_BASED_CONNECTORS.includes(type);
};

export const isListPageOpened = (pathname = '') => {
    return /new$/.test(pathname);
};