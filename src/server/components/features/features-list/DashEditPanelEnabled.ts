import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.DashEditPanelEnabled,
    state: {
        development: false,
        production: false,
    },
});