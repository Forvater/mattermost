// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {AppBinding} from '@mattermost/types/apps';

import {Preferences} from 'mattermost-redux/constants';
import {createSelector} from 'mattermost-redux/selectors/create_selector';
import {appBarEnabled, getAppBarAppBindings} from 'mattermost-redux/selectors/entities/apps';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {createShallowSelector} from 'mattermost-redux/utils/helpers';

import type {GlobalState} from 'types/store';
import type {ChannelTabButtonItem, FileDropdownPluginComponent, LeftHandSidebarItem, PluginComponent} from 'types/store/plugins';

export const getPluginUserSettings = createSelector(
    'getPluginUserSettings',
    (state: GlobalState) => state.plugins.userSettings,
    (settings) => {
        return settings || {};
    },
);

export const getFilesDropdownPluginMenuItems = createSelector(
    'getFilesDropdownPluginMenuItems',
    (state: GlobalState) => state.plugins.components.FilesDropdown,
    (components) => {
        return (components || []) as unknown as FileDropdownPluginComponent[];
    },
);

export const getUserGuideDropdownPluginMenuItems = createSelector(
    'getUserGuideDropdownPluginMenuItems',
    (state: GlobalState) => state.plugins.components.UserGuideDropdown,
    (components) => {
        return components;
    },
);

export const getChannelHeaderPluginComponents = createSelector(
    'getChannelHeaderPluginComponents',
    (state: GlobalState) => appBarEnabled(state),
    (state: GlobalState) => state.plugins.components.ChannelHeaderButton,
    (state: GlobalState) => state.plugins.components.AppBar,
    (enabled, channelHeaderComponents = [], appBarComponents = []) => {
        if (!enabled || !appBarComponents.length) {
            return channelHeaderComponents as unknown as PluginComponent[];
        }

        // Remove channel header icons for plugins that have also registered an app bar component
        const appBarPluginIds = appBarComponents.map((appBarComponent) => appBarComponent.pluginId);
        return channelHeaderComponents.filter((channelHeaderComponent) => !appBarPluginIds.includes(channelHeaderComponent.pluginId));
    },
);

const getChannelHeaderMenuPluginComponentsShouldRender = createSelector(
    'getChannelHeaderMenuPluginComponentsShouldRender',
    (state: GlobalState) => state,
    (state: GlobalState) => state.plugins.components.ChannelHeader,
    (state, channelHeaderMenuComponents = []) => {
        return channelHeaderMenuComponents.map((component) => {
            if (typeof component.shouldRender === 'function') {
                return component.shouldRender(state);
            }

            return true;
        });
    },
);

export const getChannelHeaderMenuPluginComponents = createShallowSelector(
    'getChannelHeaderMenuPluginComponents',
    getChannelHeaderMenuPluginComponentsShouldRender,
    (state: GlobalState) => state.plugins.components.ChannelHeader,
    (componentShouldRender = [], channelHeaderMenuComponents = []) => {
        return channelHeaderMenuComponents.filter((component, idx) => componentShouldRender[idx]);
    },
);

export const getLeftHandSidebarItemPluginComponents = createSelector(
    'getLeftHandSidebarItemPluginComponents',
    (state: GlobalState) => state.plugins.components.LeftHandSidebarItem,
    (components) => {
        return (components || []) as unknown as LeftHandSidebarItem[];
    },
);

export const getChannelIntroPluginButtons = createSelector(
    'getChannelIntroPluginButtons',
    (state: GlobalState) => state.plugins.components.ChannelIntroButton,
    (components = []) => {
        return components;
    },
);

export const getAppBarPluginComponents = createSelector(
    'getAppBarPluginComponents',
    (state: GlobalState) => state.plugins.components.AppBar,
    (components = []) => {
        return components;
    },
);

export const getChannelTabPluginComponents = createSelector(
    'getChannelTabPluginComponents',
    (state: GlobalState) => state.plugins.components.ChannelTabButton,
    (components = []) => {
        return (components || []) as unknown as ChannelTabButtonItem[];
    },
);

export const getChannelTabPluginComponent = createSelector(
    'getChannelTabPluginComponent',
    getChannelTabPluginComponents,
    (_: GlobalState, id: string) => id,
    (components = [], id) => {
        return components.find((c) => c.id === id);
    },
);

export const getChannelTabPluginComponentsForChannel = createSelector(
    'getChannelTabPluginComponentsForChannel',
    getChannelTabPluginComponents,
    (_: GlobalState, channelId: string) => channelId,
    (tabButtons = [], channelId) => {
        return tabButtons.filter((t) => t.channelId === channelId);
    },
);

export const getChannelContentPluginComponents = createSelector(
    'getChannelContentPluginComponents',
    (state: GlobalState) => state.plugins.components.ChannelContentComponent,
    (components = []) => {
        const byId: Record<string, PluginComponent> = {};
        components.forEach((c) => {
            byId[c.id] = c;
        });
        return byId;
    },
);

export const shouldShowAppBar = createSelector(
    'shouldShowAppBar',
    appBarEnabled,
    getAppBarAppBindings,
    getAppBarPluginComponents,
    getChannelHeaderPluginComponents,
    (enabled: boolean, bindings: AppBinding[], appBarComponents: PluginComponent[], channelHeaderComponents) => {
        return enabled && Boolean(bindings.length || appBarComponents.length || channelHeaderComponents.length);
    },
);

export function showNewChannelWithBoardPulsatingDot(state: GlobalState): boolean {
    const pulsatingDotState = get(state, Preferences.APP_BAR, Preferences.NEW_CHANNEL_WITH_BOARD_TOUR_SHOWED, '');
    const showPulsatingDot = pulsatingDotState !== '' && JSON.parse(pulsatingDotState)[Preferences.NEW_CHANNEL_WITH_BOARD_TOUR_SHOWED] === false;
    return showPulsatingDot;
}
