export function add(first: number, second: number): number {
  return first + second;
}

function internalHelper(): number {
  return 0;
}

const internalValue = internalHelper();