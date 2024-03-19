export type Positions = {
    date: number,
    value: number,
  }
  
  export type Series = {
    label: string,
    data: Positions[],
  }