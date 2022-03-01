import ReactDOM from "react-dom";

const domainPrefix: string = 'http://localhost:3000/?'

const alphabets: string[] = "abcdefghijklmnopqrstuvwxyz".split("");
const primes: bigint[] = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101,
].map((value) => BigInt(value));

const base36: string[] = "0123456789".split("").concat(alphabets);
export const wordMaxLength = base36.length;

function stringToPrime(s: string) {
  return primes[alphabets.indexOf(s)];
}

// Encodes word and tries
export function encode(word: string, tries: number) {
  const letters: string[] = word.split("");
  // Encode word into the product of primes and the order of letters
  const primeList: bigint[] = letters.map((value) => stringToPrime(value));
  const wordEncoded: bigint = primeList.reduce(
    (prev: bigint, curr: bigint) => prev * curr
  );

  let lettersOrdered = word.split("").sort();
  const order: string = lettersOrdered
    .map((value) => {
      const idx = letters.indexOf(value);
      letters[idx] = '';
      return base36[idx];
    })
    .reduce((pre, cur) => pre + cur);

  return `${domainPrefix}word=${wordEncoded}&order=${order}&tries=${tries}`;
}

// Decodes code into a word and number of tries
// Produces a [string, number] pair if possible
// produces null if not possible
export function decode(code: string): [string, number] | null {
  const wordMatch = code.match(/word=[0-9]+/);
  if (!wordMatch) {
    return null;
  }
  var encodedWord: bigint = BigInt(wordMatch[0].substring('word='.length));

  // Gets all the letters of word
  const letters: string[] = [];
  for (let i = 0; i < primes.length; ++i) {
    if (encodedWord % primes[i] === BigInt(0)) {
      encodedWord /= primes[i];
      letters.push(alphabets[i]);
      i -= 1;
    }
  }

  // Gets the order of the letters
  const orderMatch = code.match(/order=[0-9a-z]+/);
  if (!orderMatch) {
    return null;
  }
  const order: number[] = orderMatch[0]
    .substring('order='.length)
    .split("")
    .map((value) => base36.indexOf(value));

  // Restore the word
  const lettersMap: string[] = [];
  for (let i = 0; i < order.length; ++i) {
    lettersMap[order[i]] = letters[i];
  }
  const word = lettersMap.reduce((pre: string, cur: string) => pre + cur);
  // Get the number of tries
  const triesMatch = code.match(/tries=[0-9]+/);
  if (!triesMatch) {
    return null;
  }
  const tries = parseInt(triesMatch[0].substring('tries='.length));

  return [word, tries];
}
