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

import { Cell } from '../../../types/editable';

const MAX_CELLS_PER_ROW = 12;

/**
 * Sum up cell sizes: Σ(cell[size]).
 */
export const sumSizes = (cells: Array<Cell> = []): number =>
  cells.reduce(
    // tslint:disable-next-line:no-any
    ({ size: p = 99, inline: a }: any, { size: c = 99, inline: b }: any) => ({
      size: (a ? 0 : 1) * p + (b ? 0 : 1) * c,
    }),
    { size: 0 }
  ).size;

/**
 * Updates each cell's size boundaries.
 */
export const computeBounds = (cells: Array<Cell> = []): Array<Cell> =>
  cells.map(
    (c: Cell, k: number): Cell => ({
      ...c,
      bounds: {
        left: 12,
        right: 12,
      },
    })
  );

/**
 * Computes if a cell is resizable.
 */
export const computeResizeable = (cells: Array<Cell> = []): Array<Cell> =>
  cells.map(
    (c: Cell, k: number): Cell => ({
      ...c,
      resizable: cells.length > 1 && k !== cells.length - 1,
    })
  );

/**
 * Computes sizes an inline element was found.
 */
export const computeInlines = (cells: Array<Cell> = []): Array<Cell> => {
  if (cells.length !== 2 || !cells[0].inline) {
    return cells.map((c: Cell) => ({
      ...c,
      inline: null,
      hasInlineNeighbour: null,
    }));
  }

  const inline = cells[0].inline;
  return [
    {
      ...cells[0],
      resizable: true,
      size: cells[0].size || Math.round(MAX_CELLS_PER_ROW / 2),
      bounds: {
        left: inline === 'left' ? 0 : MAX_CELLS_PER_ROW - 1,
        right: inline === 'right' ? 0 : MAX_CELLS_PER_ROW - 1,
      },
    },
    {
      ...cells[1],
      bounds: { left: 0, right: 0 },
      size: 12,
      hasInlineNeighbour: cells[0].id,
    },
  ];
};

/**
 * Resize cells.
 */
export const resizeCells = (
  cells: Array<Cell> = [],
  { id, size }: Cell
): Array<Cell> => {
  return cells.map((c: Cell) => {
    if (id === c.id) {
      return { ...c, size };
    }
    return c;
  });
};

/**
 * Balance cell sizes.
 *
 * @param {[...cell]} cells
 * @return {[...cell]}
 */
export const computeSizes = (cells: Array<Cell> = []): Array<Cell> => {

  return cells.map((c: Cell, k: number) => ({
    ...c,
    size: c.size !== undefined ? c.size : 12,
  }));
};
