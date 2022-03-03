import ReactDOM from "react-dom";

const domainName: string = window.location.origin + "/?";

const alphabets: string[] = "abcdefghijklmnopqrstuvwxyz".split("");
const primes: bigint[] = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101,
].map((value) => BigInt(value));

export const maxTries = 9;

const URLWord = "word";
const URLOrder = "order";
const URLTries = "tries";

const base36: string[] = "0123456789".split("").concat(alphabets);
export const wordMaxLength = base36.length;

function stringToPrime(s: string) {
  return primes[alphabets.indexOf(s)];
}

// Encodes word and tries
export function encode(word: string, tries: number) {
  // TODO Use URLSearchParams
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
      letters[idx] = "";
      return base36[idx];
    })
    .reduce((pre, cur) => pre + cur);

  const encoded = new URLSearchParams("");
  encoded.set(URLWord, `${wordEncoded}`);
  encoded.set(URLOrder, `${order}`);
  encoded.set(URLTries, `${tries}`);

  return domainName + encoded.toString();
}

// Decodes code into a word and number of tries
// Produces a [string, number] pair if possible
// produces null if not possible
export function decode(link: string): [string, number] | null {
  const entries = new URLSearchParams(link);

  //  Check parameters are valid
  if (
    !entries.has(URLWord) ||
    !entries.has(URLOrder) ||
    !entries.has(URLTries)
  ) {
    return null;
  }
  const wordParam = entries.get(URLWord)!;
  const orderParam = entries.get(URLOrder)!;
  const triesParam = entries.get(URLTries)!;
  if (
    wordParam.match(/[0-9]*/)![0] !== wordParam ||
    orderParam.match(/[0-9a-z]*/)![0] !== orderParam ||
    Number.isNaN(
      parseInt(triesParam) ||
        (0 < parseInt(triesParam) && parseInt(triesParam) < maxTries)
    )
  ) {
    return null;
  }

  // Decode the parameters
  var encodedWord: bigint = BigInt(wordParam);
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
  const order: number[] = orderParam
    .split("")
    .map((value) => base36.indexOf(value));

  // Restore the word
  const lettersMap: string[] = [];
  for (let i = 0; i < order.length; ++i) {
    lettersMap[order[i]] = letters[i];
  }
  const word = lettersMap.reduce((pre: string, cur: string) => pre + cur);
  const tries = parseInt(triesParam);

  return [word, tries];
}
