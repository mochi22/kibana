/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { schema } from '@kbn/config-schema';
import { getHighestTimeUnit, isValidRolloverInterval } from './utils';

const duration = (raw: string) => schema.duration().validate(raw);

describe('getHighestTimeUnit', () => {
  it('returns the highest time unit of the duration', () => {
    expect(getHighestTimeUnit(duration('500ms'))).toEqual('millisecond');
    expect(getHighestTimeUnit(duration('30s'))).toEqual('second');
    expect(getHighestTimeUnit(duration('15m'))).toEqual('minute');
    expect(getHighestTimeUnit(duration('12h'))).toEqual('hour');
    expect(getHighestTimeUnit(duration('4d'))).toEqual('day');
    expect(getHighestTimeUnit(duration('3w'))).toEqual('week');
    expect(getHighestTimeUnit(duration('7M'))).toEqual('month');
    expect(getHighestTimeUnit(duration('7Y'))).toEqual('year');
  });

  it('handles overflows', () => {
    expect(getHighestTimeUnit(duration('2000ms'))).toEqual('second');
    expect(getHighestTimeUnit(duration('90s'))).toEqual('minute');
    expect(getHighestTimeUnit(duration('75m'))).toEqual('hour');
    expect(getHighestTimeUnit(duration('36h'))).toEqual('day');
    expect(getHighestTimeUnit(duration('9d'))).toEqual('week');
    expect(getHighestTimeUnit(duration('15w'))).toEqual('month');
    expect(getHighestTimeUnit(duration('23M'))).toEqual('year');
  });
});

describe('isValidRolloverInterval', () => {
  it('returns true if the interval does not overflow', () => {
    expect(isValidRolloverInterval(duration('500ms'))).toEqual(true);
    expect(isValidRolloverInterval(duration('30s'))).toEqual(true);
    expect(isValidRolloverInterval(duration('15m'))).toEqual(true);
    expect(isValidRolloverInterval(duration('12h'))).toEqual(true);
    expect(isValidRolloverInterval(duration('4d'))).toEqual(true);
    expect(isValidRolloverInterval(duration('3w'))).toEqual(true);
    expect(isValidRolloverInterval(duration('7M'))).toEqual(true);
    expect(isValidRolloverInterval(duration('7Y'))).toEqual(true);
  });

  it('returns false if the interval overflows to a non integer value', () => {
    expect(isValidRolloverInterval(duration('2500ms'))).toEqual(false);
    expect(isValidRolloverInterval(duration('90s'))).toEqual(false);
    expect(isValidRolloverInterval(duration('75m'))).toEqual(false);
    expect(isValidRolloverInterval(duration('36h'))).toEqual(false);
    expect(isValidRolloverInterval(duration('9d'))).toEqual(false);
    expect(isValidRolloverInterval(duration('15w'))).toEqual(false);
    expect(isValidRolloverInterval(duration('23M'))).toEqual(false);
  });

  it('returns true if the interval overflows to an integer value', () => {
    expect(isValidRolloverInterval(duration('2000ms'))).toEqual(true);
    expect(isValidRolloverInterval(duration('120s'))).toEqual(true);
    expect(isValidRolloverInterval(duration('240m'))).toEqual(true);
    expect(isValidRolloverInterval(duration('48h'))).toEqual(true);
    expect(isValidRolloverInterval(duration('14d'))).toEqual(true);
    expect(isValidRolloverInterval(duration('24M'))).toEqual(true);
  });
});
