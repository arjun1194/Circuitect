/**
 * Dense linear solver — Gaussian elimination with partial pivoting.
 * Circuits here are tiny (well under ~100 unknowns), so a straightforward dense
 * solve is plenty and easy to reason about / test.
 */

/**
 * Solve A·x = b in place-safe fashion (A and b are copied).
 * Returns the solution vector, or null if the system is singular.
 */
export function solveLinear(A: number[][], b: number[]): number[] | null {
    const n = b.length;
    if (n === 0) return [];

    // Augmented matrix copy.
    const M: number[][] = A.map((row, i) => {
        const r = row.slice(0, n);
        r.push(b[i]);
        return r;
    });

    for (let col = 0; col < n; col++) {
        // Partial pivot: largest magnitude in this column.
        let pivot = col;
        let max = Math.abs(M[col][col]);
        for (let r = col + 1; r < n; r++) {
            const v = Math.abs(M[r][col]);
            if (v > max) {
                max = v;
                pivot = r;
            }
        }
        if (max < 1e-20) return null; // singular / unsolvable

        if (pivot !== col) {
            const tmp = M[col];
            M[col] = M[pivot];
            M[pivot] = tmp;
        }

        const pivVal = M[col][col];
        for (let r = col + 1; r < n; r++) {
            const factor = M[r][col] / pivVal;
            if (factor !== 0) {
                for (let c = col; c <= n; c++) {
                    M[r][c] -= factor * M[col][c];
                }
            }
        }
    }

    // Back-substitution.
    const x = new Array<number>(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = M[i][n];
        for (let c = i + 1; c < n; c++) sum -= M[i][c] * x[c];
        x[i] = sum / M[i][i];
    }
    return x;
}
