import {Page} from '@playwright/test';

import DatasetPage from '../../../page-objects/dataset/DatasetPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {RobotChartsDatasetUrls} from '../../../utils/constants';

datalensTest.describe('Datasets - working with avatars', () => {
    datalensTest('Adding Avatar CH', async ({page}: {page: Page}) => {
        const datasetPage = new DatasetPage({page});

        await openTestPage(page, RobotChartsDatasetUrls.NewDataset, {id: 'jbconcutsv1if'});

        await datasetPage.waitForSelector(slct('ds-source'));

        await datasetPage.addAvatarByDragAndDrop();

        await datasetPage.waitForSelector(slct('ds-avatar'));

        const avatarsCount = (await datasetPage.page.$$(slct('ds-avatar'))).length;

        if (!avatarsCount) {
            throw new Error('Avatar not added');
        } else if (avatarsCount > 1) {
            throw new Error('More than one avatar added');
        }
    });
});
