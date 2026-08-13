/* THIS EXTENSION'S OWN VIEW OF THE WIRE — the two shapes it reads, declared here rather than imported.
 *
 * In the monorepo these came from `@intentic/sandbox-contract`, which is right there and costs nothing to
 * import. Out here it is the wrong dependency twice over. It is the daemon's WHOLE contract — every route in
 * the product — reached for two objects of three fields each, and it bundles: nothing the host publishes
 * through its import map can be marked external, so importing the barrel put the entire contract and its
 * schema library into a log viewer's bundle. 265 kB for a list of file names.
 *
 * The deeper reason is not size. An extension is pinned to a commit and the host keeps moving, so what it
 * actually needs is a statement of the shape IT depends on — a narrow, checkable claim that fails loudly on the
 * day the daemon's answer stops matching. Importing the host's own contract states the opposite: whatever the
 * daemon currently says, that is what I expect. The first is a version boundary; the second is a coincidence.
 *
 * So: hand-written, and validated rather than cast. `as` would let a changed daemon reach the template as
 * `undefined` somewhere deep in a render; this fails at the fetch, where the message can name the field. */

export interface LogFileEntry {
    // Path relative to the logs root, e.g. "terminals/web-1-%0.log" or "daemon.log".
    readonly name: string;
    readonly sizeBytes: number;
    // Epoch ms mtime.
    readonly modifiedAt: number;
}

export interface LogRead {
    readonly name: string;
    readonly sizeBytes: number;
    // The tail text; truncated when the file holds more than the requested bytes.
    readonly text: string;
    readonly truncated: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === `object` && value !== null;

// Names the first field that is missing or of the wrong type, because "the daemon answered something else" is
// not an actionable sentence and "logs: files[3].sizeBytes is not a number" is.
const check = (value: unknown, where: string, fields: Readonly<Record<string, `string` | `number` | `boolean`>>): void => {
    if (!isRecord(value)) {
        throw new Error(`${where} is not an object`);
    }
    for (const [field, type] of Object.entries(fields)) {
        // eslint-disable-next-line valid-typeof -- the table above is the allowlist
        if (typeof value[field] !== type) {
            throw new Error(`${where}.${field} is not a ${type}`);
        }
    }
};

export const parseLogsList = (value: unknown): LogFileEntry[] => {
    if (!isRecord(value) || !Array.isArray(value.files)) {
        throw new Error(`logs: the daemon did not answer with a files array`);
    }
    value.files.forEach((entry, index) => check(entry, `logs.files[${index}]`, { name: `string`, sizeBytes: `number`, modifiedAt: `number` }));
    return value.files as LogFileEntry[];
};

export const parseLogRead = (value: unknown): LogRead => {
    check(value, `logs.file`, { name: `string`, sizeBytes: `number`, text: `string`, truncated: `boolean` });
    return value as LogRead;
};
