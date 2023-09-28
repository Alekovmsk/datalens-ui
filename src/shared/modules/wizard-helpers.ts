import {
    DEFAULT_FLOAT_NUMBERS,
    DEFAULT_FORMATTING,
    DEFAULT_INTEGER_NUMBERS,
    GradientType,
    PERCENT_VISUALIZATIONS,
    PlaceholderId,
    PseudoFieldTitle,
    RGBColor,
    VISUALIZATIONS_WITH_DIMENSIONS_AS_COLORS,
    VISUALIZATIONS_WITH_SEVERAL_FIELDS_X_PLACEHOLDER,
    WizardVisualizationId,
} from '../constants';
import {
    CommonNumberFormattingOptions,
    Dataset,
    Field,
    MarkupItem,
    ServerFieldFormatting,
    Update,
    V3Label,
    isDateField,
    isFloatField,
    isNumberField,
} from '../types';

export const isMeasureName = (field: {type: string; title: string}) =>
    field.type === 'PSEUDO' && field.title === PseudoFieldTitle.MeasureNames;

export const isMeasureValue = (field?: {type: string; title: string}) =>
    field?.type === 'PSEUDO' && field?.title === PseudoFieldTitle.MeasureValues;

export const isMeasureType = (field: {type: string}) => field.type === 'MEASURE';

export const isMeasureNameOrValue = (field: {type: string; title: string}) =>
    isMeasureName(field) || isMeasureValue(field);

export const createMeasureNames = () =>
    ({
        title: PseudoFieldTitle.MeasureNames,
        type: 'PSEUDO',
        className: 'item pseudo-item dimension-item',
        data_type: 'string',
    } as Field);

export const createMeasureValues = () =>
    ({
        title: PseudoFieldTitle.MeasureValues,
        type: 'PSEUDO',
        className: 'item pseudo-item measure-item',
        data_type: 'float',
    } as Field);

export const getDefaultFormatting = (
    field: Field | undefined,
): ServerFieldFormatting | CommonNumberFormattingOptions => {
    if (!field) {
        return {} as CommonNumberFormattingOptions;
    }
    return {
        ...DEFAULT_FORMATTING,
        labelMode: (field as V3Label).labelMode || DEFAULT_FORMATTING.labelMode,
        precision: isFloatField(field) ? DEFAULT_FLOAT_NUMBERS : DEFAULT_INTEGER_NUMBERS,
    };
};
export const getResultSchemaFromDataset = (dataset?: Dataset | Dataset['dataset']): Field[] => {
    if (!dataset) {
        return [];
    }

    const schema = (
        'dataset' in dataset ? dataset.dataset.result_schema : dataset.result_schema
    ) as Field[];

    // Return the default empty array, because some cases
    // there may be a dataset without result_schema
    return schema || [];
};

export const filterUpdatesByDatasetId = (updates: Update[], datasetId: string) => {
    return updates.filter((update) => {
        return (
            // Checking for typeof - fallback, because in the old charts updates did not contain datasetId
            typeof update.field.datasetId === 'undefined' || update.field.datasetId === datasetId
        );
    });
};

export const isPercentVisualization = (visualizationId: string) =>
    PERCENT_VISUALIZATIONS.has(visualizationId);

export const isVisualizationWithDimensionsAsColors = (visualizationId: string) =>
    VISUALIZATIONS_WITH_DIMENSIONS_AS_COLORS.has(visualizationId);

export const isVisualizationWithSeveralFieldsXPlaceholder = (visualizationId: string) =>
    VISUALIZATIONS_WITH_SEVERAL_FIELDS_X_PLACEHOLDER.has(visualizationId);

function markupToRawString(obj: MarkupItem, str = ''): string {
    let text = str;

    if (obj.children) {
        text = text + obj.children.map((item) => markupToRawString(item, text)).join('');
    } else if (obj.content && typeof obj.content === 'string') {
        text = text + obj.content;
    } else if (obj.content && typeof obj.content === 'object') {
        text = markupToRawString(obj.content, text);
    }

    return text;
}

export {markupToRawString};

export function getDeltasByColorValuesMap(
    colorValues: (number | null)[],
    min: number,
    range: number,
) {
    return colorValues.reduce((acc, colorValue) => {
        const delta = getRangeDelta(colorValue, min, range);
        if (typeof colorValue !== 'number' || typeof delta !== 'number') {
            return acc;
        }

        return {
            ...acc,
            [colorValue]: delta,
        };
    }, {} as Record<number, number>);
}

export function getRgbColorValue(
    delta: number,
    gradientMode: string | GradientType,
    rangeMiddleRatio: number,
    colors: RGBColor[],
): string {
    let resultDelta = delta;
    let shadeA: RGBColor;
    let shadeB: RGBColor;
    if (gradientMode === GradientType.THREE_POINT) {
        if (delta >= rangeMiddleRatio) {
            // ../technotes.md -> utils/colors-helpers p1
            resultDelta = delta === 1 ? delta : delta - rangeMiddleRatio;
            shadeA = colors[1];
            shadeB = colors[2];
        } else {
            shadeA = colors[0];
            shadeB = colors[1];
        }
    } else {
        shadeA = colors[0];
        shadeB = colors[1];
    }

    return `rgb(
        ${Math.floor((shadeB.red - shadeA.red) * resultDelta + shadeA.red)},
        ${Math.floor((shadeB.green - shadeA.green) * resultDelta + shadeA.green)},
        ${Math.floor((shadeB.blue - shadeA.blue) * resultDelta + shadeA.blue)}
    )`;
}

export function getRangeDelta(
    colorValue: number | null,
    min: number,
    range: number,
): number | null {
    let delta = typeof colorValue === 'number' ? (colorValue - min) / range : null;

    if (delta !== null) {
        if (delta > 1) {
            delta = 1;
        } else if (delta < 0) {
            delta = 0;
        }
    }

    return delta;
}

export const isPlaceholderSupportsAxisMode = (
    placeholderId: PlaceholderId,
    visualizationId: WizardVisualizationId,
) => {
    const isReversedXYPlaceholderVisualization =
        visualizationId === WizardVisualizationId.Bar ||
        visualizationId === WizardVisualizationId.Bar100p;
    const isXPlaceholder =
        placeholderId === PlaceholderId.X && !isReversedXYPlaceholderVisualization;

    const isReversedYPlaceholder =
        placeholderId === PlaceholderId.Y && isReversedXYPlaceholderVisualization;

    return isXPlaceholder || isReversedYPlaceholder;
};

export const isAllAxisModesAvailable = (field?: {data_type: string}) => {
    return isNumberField(field) || isDateField(field);
};