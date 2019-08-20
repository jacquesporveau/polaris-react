import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {mountWithAppProvider, trigger} from 'test-utilities/legacy';

import {MenuGroupDescriptor, ActionListItemDescriptor} from '../../../types';
import {MenuAction, MenuGroup, RollupActions} from '../components';
import {ActionMenu, ActionMenuProps} from '../ActionMenu';

describe('<ActionMenu />', () => {
  const mockProps: ActionMenuProps = {
    actions: undefined,
    groups: undefined,
    rollup: undefined,
  };

  it('does not render when there are no `actions` or `groups`', () => {
    const wrapper = mountWithAppProvider(<ActionMenu {...mockProps} />);
    expect(wrapper.find('div').exists()).toBe(false);
  });

  describe('actions', () => {
    const mockActions: ActionMenuProps['actions'] = [
      {content: 'mock content 1'},
      {content: 'mock content 2'},
    ];

    it('renders as <MenuAction /> when `rollup` is `false`', () => {
      const wrapper = mountWithAppProvider(
        <ActionMenu {...mockProps} actions={mockActions} />,
      );

      expect(wrapper.find(MenuAction)).toHaveLength(mockActions.length);
    });

    it('renders as <RollupActions /> `items` when `rollup` is `true`', () => {
      const wrapper = mountWithAppProvider(
        <ActionMenu {...mockProps} actions={mockActions} rollup />,
      );

      expect(wrapper.find(RollupActions).prop('items')).toStrictEqual(
        mockActions,
      );
    });

    it('renders actions in their overridden order when their index set', () => {
      const overrideIndex = 1;
      const actionWithIndex = {
        content: 'mock content 1',
        index: overrideIndex,
      };

      const actions: ActionMenuProps['actions'] = [
        actionWithIndex,
        {content: 'mock content 0'},
      ];

      const wrapper = mountWithAppProvider(<ActionMenu actions={actions} />);

      expect(
        wrapper
          .find(MenuAction)
          .at(overrideIndex)
          .prop('content'),
      ).toBe(actionWithIndex.content);
    });

    it('renders actions in their initial order when their index is not set', () => {
      const overrideIndex = 1;
      const actionWithIndex = {
        content: 'mock content 1',
        index: overrideIndex,
      };

      const actionsBeforeOverriddenOrder: ActionMenuProps['actions'] = [
        actionWithIndex,
        {content: 'mock content 0'},
        {content: 'mock content 2'},
      ];

      const expectedOrderAfterOverride = [
        {content: 'mock content 0'},
        actionWithIndex,
        {content: 'mock content 2'},
      ];

      const wrapper = mountWithAppProvider(
        <ActionMenu actions={actionsBeforeOverriddenOrder} />,
      );

      wrapper.find(MenuAction).forEach((action, index) => {
        expect(action.props()).toMatchObject(expectedOrderAfterOverride[index]);
      });
    });
  });

  describe('groups', () => {
    const mockActions: ActionMenuProps['actions'] = [
      {content: 'mock content 1'},
      {content: 'mock content 2'},
    ];
    const mockGroups: ActionMenuProps['groups'] = [
      {
        title: 'First group',
        actions: [...mockActions],
      },
      {
        title: 'Second group',
        actions: [...mockActions],
      },
    ];

    it('renders as <MenuGroup /> when `rollup` is `false`', () => {
      const wrapper = mountWithAppProvider(
        <ActionMenu {...mockProps} groups={mockGroups} />,
      );

      expect(wrapper.find(MenuGroup)).toHaveLength(mockGroups.length);
    });

    it('renders as <RollupActions /> `sections` when `rollup` is `true`', () => {
      const convertedSections = mockGroups.map((group) => {
        return {title: group.title, items: group.actions};
      });
      const wrapper = mountWithAppProvider(
        <ActionMenu {...mockProps} groups={mockGroups} rollup />,
      );

      expect(wrapper.find(RollupActions).prop('sections')).toStrictEqual(
        convertedSections,
      );
    });

    it('renders groups at their overriden order when their index is set', () => {
      const overrideIndex = 1;
      const groupWithIndex = {
        title: 'group with explicit order in menu',
        actions: [{content: 'mock content 1'}],
        index: overrideIndex,
      };

      const groups = [...mockGroups, groupWithIndex];
      const wrapper = mountWithAppProvider(<ActionMenu groups={groups} />);

      expect(
        wrapper
          .find(MenuGroup)
          .at(overrideIndex)
          .prop('title'),
      ).toBe(groupWithIndex.title);
    });

    it('renders groups in their initial order when their index is not set', () => {
      const overrideIndex = 1;
      const groupWithIndex = {
        title: 'group with explicit order in menu',
        actions: [{content: 'mock content 1'}],
        index: overrideIndex,
      };

      const groupsBeforeOverriddenOrder = [...mockGroups, groupWithIndex];
      const expectedOrderAfterOverride = [
        mockGroups[0],
        groupWithIndex,
        mockGroups[1],
      ];

      const wrapper = mountWithAppProvider(
        <ActionMenu groups={groupsBeforeOverriddenOrder} />,
      );

      wrapper.find(MenuGroup).forEach((group, index) => {
        expect(group.props()).toMatchObject(expectedOrderAfterOverride[index]);
      });
    });
  });

  describe('<MenuAction />', () => {
    const mockActions: ActionMenuProps['actions'] = [
      {content: 'mock content 1'},
      {content: 'mock content 2'},
    ];

    it('does not render <MenuAction /> when there are no `actions`', () => {
      const wrapper = mountWithAppProvider(<ActionMenu {...mockProps} />);

      expect(wrapper.find(MenuAction)).toHaveLength(0);
    });

    it('renders `actions`', () => {
      const wrapper = mountWithAppProvider(
        <ActionMenu {...mockProps} actions={mockActions} />,
      );

      expect(wrapper.find(MenuAction)).toHaveLength(2);
    });
  });

  describe('<MenuGroup />', () => {
    it('does not render when there are no `groups`', () => {
      const wrapper = mountWithAppProvider(<ActionMenu {...mockProps} />);

      expect(wrapper.find(MenuGroup)).toHaveLength(0);
    });

    it('does not render when there are `groups` with no `actions`', () => {
      const mockGroupsWithoutActions: ActionMenuProps['groups'] = [
        {
          title: 'First group',
          actions: [],
        },
        {
          title: 'Second group',
          actions: [],
        },
      ];
      const wrapper = mountWithAppProvider(
        <ActionMenu groups={mockGroupsWithoutActions} />,
      );

      expect(wrapper.find(MenuGroup)).toHaveLength(0);
    });

    it('is inactive by default', () => {
      const mockGroups = [fillMenuGroup()];
      const wrapper = mountWithAppProvider(
        <ActionMenu {...mockProps} groups={mockGroups} />,
      );

      expect(wrapper.find(MenuGroup).prop('active')).toBeFalsy();
    });

    it('becomes active when opened', () => {
      const mockTitle = 'mock title';
      const mockGroups = [fillMenuGroup({title: mockTitle})];
      const wrapper = mountWithAppProvider(
        <ActionMenu {...mockProps} groups={mockGroups} />,
      );

      trigger(wrapper.find(MenuGroup), 'onOpen', mockTitle);

      expect(wrapper.find(MenuGroup).prop('active')).toBeTruthy();
    });

    it('becomes inactive when closed', () => {
      const mockTitle = 'mock title';
      const mockGroups = [fillMenuGroup({title: mockTitle})];
      const wrapper = mountWithAppProvider(
        <ActionMenu {...mockProps} groups={mockGroups} />,
      );

      trigger(wrapper.find(MenuGroup), 'onOpen', mockTitle);
      trigger(wrapper.find(MenuGroup), 'onClose', mockTitle);

      expect(wrapper.find(MenuGroup).prop('active')).toBeFalsy();
    });
  });
});

function fillMenuGroup(partialMenuGroup?: Partial<MenuGroupDescriptor>) {
  const mockAction: ActionListItemDescriptor = {
    content: 'mock content',
    url: 'https://shopify.ca',
    target: 'REMOTE',
  };

  return {
    title: 'mock menu group title',
    actions: [mockAction],
    ...partialMenuGroup,
  };
}
