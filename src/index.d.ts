export interface Tag {
  /** The tag to recognise. */
  tag: string;
  /** The value type the tag should have. */
  value:
    | NumberConstructor
    | StringConstructor
    | BooleanConstructor
    | RegExpConstructor
    | ArrayConstructor
    | ObjectConstructor
    | JSON
    | string;
  /**
   * Whether or not to resolve the value property into a proper type before
   * replacing the text. Set to false if you want to use custom regex as your
   * value.
   *
   * @defaultValue `true`
   */
  resolve?: boolean;
}

export interface Options {
  /** The string to parse command tags from. */
  string: string;
  /**
   * The prefix that would recognize a word as a tag. e.g "--big", "--" being
   * the prefix.
   *
   * @defaultValue `--`
   */
  prefix?: string | RegExp;
  /**
   * Whether or not to match numbers too when you pass String into the Tag
   * object. e.g "hello2" will match with this enabled, and won't with this
   * disabled.
   *
   * @defaultValue `true`
   */
  numbersInStrings?: boolean;
  /**
   * Whether or not it should remove every word that starts with the prefix,
   * but only match valid tags.
   *
   * @defaultValue `false`
   */
  removeAllTags?: boolean;

  /**
   * Whether or not negative numbers can be matched if only looking for a number.
   *
   * @defaultValue `true`
   */
  negativeNumbers?: boolean;
  /**
   * Whether or not doubles (non-integers) can be matched, such as `23.90`
   *
   * @defaultValue `false`
   */
  numberDoubles?: boolean;
  /**
   * Whether or not matched tags should be returned in lowercase. e.g: match
   * `HELLOWORLD` and `helloWorld` and return as `helloworld`.
   *
   * @defaultValue `true`
   */
  lowercaseTags?: boolean;
  /** Default types that matches tags should be parsed into. */
  tagData?: Record<
    string,
    | NumberConstructor
    | StringConstructor
    | BooleanConstructor
    | ObjectConstructor
  >;
}

export interface ParsedTags {
  /** The original string. */
  string: string;
  /** The new string with all valid tags removed. */
  newString: string;
  /** All valid tags the string contained. */
  matches: string[];
  /**
   * All valid tags that had values and their values that the string
   * contained.
   *
   * - Note that this value is partially untyped.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, number | string | any[]>;
  /** The tag data that was used to parse matches. */
  tagData: Record<
    string,
    | NumberConstructor
    | StringConstructor
    | BooleanConstructor
    | ObjectConstructor
  >;
}

/**
 * Get custom command tags out of a string.
 * @param options The options to pass in, or the string to parse tags from.
 * @param tags Tags to recognize. You can pass in "\w+" to recognize anything,
 *or a tag object to make the tag have a value (e.g "--size 10"). Tags with
 *values will be put in the data object.
 * @example Matching several flag tags and one value tag
 * ```ts
 * Tagify(
 *   {
 *     string: "Write text --bold --italic --fontSize 24",
 *      prefix: "--"
 *   },
 *   "bold",
 *   "italic",
 *   "strikethrough",
 *   "underline",
 *   { fontSize: Number }
 * )
 * // -> {
 * //   string: "Write text --bold --italic",
 * //   newString: "Write text",
 * //   matches: ["bold", "italic", "fontSize"],
 * //   data: { fontSize: 24 }
 * // }
 * ```
 */
export default function Tagify(
  options: Options,
  ...tags: Array<string | Tag>
): ParsedTags;

/**
 * The package's version.
 */
export const version: string;
