/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as XLSX from "xlsx";
import { z } from "zod";

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

// Example participant schema (customize as needed)
const ParticipantSchema = z.object({
  name: z.string(),
  rating: z.number().optional(),
  // Add more fields as needed
});

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

export const processTournamentUpload = functions.firestore
  .document("uploadJobs/{jobId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    const job = snap.data();
    if (!job || job.status !== "pending" || !job.fileRef) return;

    const jobRef = snap.ref;
    await jobRef.update({ status: "processing" });

    try {
      // Download file from Storage
      const bucket = storage.bucket();
      const file = bucket.file(job.fileRef);
      const [buffer] = await file.download();

      // Parse Excel
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      // Validate and transform
      const participants: unknown[] = [];
      const errors: string[] = [];
      for (const row of data) {
        const result = ParticipantSchema.safeParse(row);
        if (result.success) {
          participants.push(result.data);
        } else {
          errors.push(JSON.stringify(result.error.issues));
        }
      }

      if (errors.length) {
        await jobRef.update({ status: "failed", errors });
        return;
      }

      // Write to Firestore in batches (max 500 per batch)
      const tournamentRef = db.collection("tournaments").doc();
      await tournamentRef.set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        // Add more metadata if needed
      });

      let batch = db.batch();
      let opCount = 0;
      for (const p of participants) {
        const partRef = tournamentRef.collection("participants").doc();
        batch.set(partRef, p);
        opCount++;
        if (opCount === 499) {
          await batch.commit();
          batch = db.batch();
          opCount = 0;
        }
      }
      if (opCount > 0) await batch.commit();

      await jobRef.update({ status: "completed", progress: 100 });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      await jobRef.update({ status: "failed", errors: [errorMsg] });
    }
  });
