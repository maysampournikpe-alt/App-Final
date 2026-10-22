/** One course outline: units in order, each with its topics in order. Topic numbers are made from the position (1.1, 1.2, ...). */
export interface Outline { /** Number of the first unit, when it is not 1 (AP Physics 2 starts at Unit 9). */ first?: number; units: { title: string; topics: string[] }[] }
