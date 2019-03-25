/*
 * This file is part of ORY Editor.
 *
 * ORY Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ORY Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with ORY Editor.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @license LGPL-3.0
 * @copyright 2016-2018 Aeneas Rekkas
 * @author Aeneas Rekkas <aeneas+oss@aeneas.io>
 *
 */

import * as React from 'react';
import { DropTarget as dropTarget } from 'react-dnd';
import Delete from '@material-ui/icons/Delete';
import Fab from '@material-ui/core/Fab';
import { Editor } from '@cybertec/ory-editor-core';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { removeCell } from '@cybertec/ory-editor-core/lib/actions/cell/core';
import throttle from 'lodash.throttle';
import {
  isEditMode,
  isLayoutMode,
  isPreviewMode,
  isInsertMode,
  isResizeMode
} from '@cybertec/ory-editor-core/lib/selector/display';
import { searchNodeEverywhere } from "@cybertec/ory-editor-core/lib/selector/editable";
import { RootState } from "@cybertec/ory-editor-core/lib/types/state";
import { LayoutPlugin, ContentPlugin } from '@cybertec/ory-editor-core/lib/service/plugin/classes';

import { createStructuredSelector } from 'reselect';

import Provider from '../Provider/index';
import { ProviderProps } from './../Provider/index';

interface DropProps {
  searchNodeEverywhere: any;
  onRemoveCell?: (state: any) => void;
  removeCell(id: string): void;
}

const target = {
  hover: throttle(
    // tslint:disable-next-line:no-any
    (props: any, monitor: any) => {
      const item = monitor.getItem();
      if (monitor.isOver({ shallow: true })) {
        item.clearHover();
      }
    },
    200,
    { trailing: false }
  ),

  // tslint:disable-next-line:no-any
  drop(props: DropProps, monitor: any) {
    const item = monitor.getItem();
    const maybeNode = props.searchNodeEverywhere(item.id);

    if (monitor.didDrop() || !monitor.isOver({ shallow: true })) {
      // If the item drop occurred deeper down the tree, don't do anything
      return;
    }

    props.removeCell(item.id);

    if (!maybeNode) {
      return;
    }

    const { node: n } = maybeNode;

    if (props.onRemoveCell) {
      props.onRemoveCell(n.content ? n.content.state : n.layout.state);
    }
  },
};

// tslint:disable-next-line:no-any
const connectMonitor = (_connect: any, monitor: any) => ({
  connectDropTarget: _connect.dropTarget(),
  isOverCurrent: monitor.isOver({ shallow: true }),
});

export interface RawProps {
  isLayoutMode: boolean;
  isOverCurrent: boolean;
  connectDropTarget: (node: JSX.Element) => JSX.Element;
}

class Raw extends React.Component<RawProps> {
  render() {
    const { connectDropTarget, isOverCurrent } = this.props;
    return connectDropTarget(
      <div
        className={classNames('ory-controls-trash', {
          'ory-controls-trash-active': this.props.isLayoutMode,
        })}
      >
        <Fab color="secondary" disabled={!isOverCurrent}>
          <Delete /> delete
        </Fab>
      </div>
    );
  }
}

const types = ({ editor }: { editor: Editor }) => {
  const plugins = [
    ...editor.plugins.plugins.layout,
    ...editor.plugins.plugins.content,
  ].map(
    (p: LayoutPlugin | ContentPlugin) =>
      p.name
  );

  if (editor.plugins.hasNativePlugin()) {
    plugins.push(editor.plugins.getNativePlugin()().name);
  }

  return plugins;
};

const mapDispatchToProps = {
  removeCell,
};

const mapStateToProps = createStructuredSelector({
  isEditMode,
  isLayoutMode,
  isPreviewMode,
  isInsertMode,
  isResizeMode,
  searchNodeEverywhere: (state: RootState) => (id: string) =>
    searchNodeEverywhere(state, id),
});

const Decorated = connect(
  mapStateToProps,
  mapDispatchToProps
)(dropTarget(types, target, connectMonitor)(Raw));

const Trash: React.SFC<ProviderProps> = props => (
  <Provider {...props}>
    <Decorated {...props} />
  </Provider>
);

export default Trash;
