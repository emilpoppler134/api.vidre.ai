import { Request, Response } from "express";
import { Types } from "mongoose";
import { Readable } from "stream";
import { ExtendedSpeech, Speech } from "../models/Speech.js";
import { Voice } from "../models/Voice.js";
import * as s3 from "../utils/aws-client.js";

async function videos(req: Request, res: Response) {
  const key: string = req.params.key;
  const doc = await s3.getObject("videos", key);

  if (doc === null) {
    return res.status(404).send(`Couldn't find the object "${key}"`);
  }
  if (doc.Body === undefined || doc.ContentType === undefined || doc.ContentLength === undefined) {
    return res.status(500).send(`The object "${key}" is damaged`);
  }

  res.writeHead(200, {
    "Content-Length": doc.ContentLength,
    "Content-Type": doc.ContentType,
    "Content-Disposition": "inline",
  });

  const stream = doc.Body as Readable;
  stream.pipe(res);
}

async function samples(req: Request, res: Response) {
  const voiceId: string = req.params.voiceId;

  if (!Types.ObjectId.isValid(voiceId)) {
    return res.status(404).send(`Invalid voice id "${voiceId}"`);
  }

  const result = await Voice.findOne({ _id: voiceId });

  if (result === null) {
    return res.status(404).send(`Couldn't find a voice with id "${voiceId}"`);
  }

  const doc = await s3.getObject("samples", `${result.sample.key}.${result.sample.extension}`);

  if (doc === null) {
    return res.status(404).send(`Couldn't find the object associated with the id "${voiceId}"`);
  }
  if (doc.Body === undefined || doc.ContentType === undefined || doc.ContentLength === undefined) {
    return res.status(500).send(`The object associated with the id "${voiceId}" is damaged`);
  }

  res.writeHead(200, {
    "Content-Length": doc.ContentLength,
    "Content-Type": doc.ContentType,
    "Content-Disposition": "inline",
  });

  const stream = doc.Body as Readable;
  stream.pipe(res);
}

async function speeches(req: Request, res: Response) {
  const speechId: string = req.params.speechId;
  const shouldDownload = req.query.download !== undefined;

  if (!Types.ObjectId.isValid(speechId)) {
    return res.status(404).send(`Invalid speech id "${speechId}"`);
  }

  const result = (await Speech.findOne({ _id: speechId }).populate({ path: "project" })) as ExtendedSpeech | null;

  if (result === null) {
    return res.status(404).send(`Couldn't find a speech with id "${speechId}"`);
  }

  const doc = await s3.getObject("speeches", `${result.object.key}.${result.object.extension}`);

  if (doc === null) {
    return res.status(404).send(`Couldn't find the object associated with the id "${speechId}"`);
  }
  if (doc.Body === undefined || doc.ContentType === undefined || doc.ContentLength === undefined) {
    return res.status(500).send(`The object associated with the id "${speechId}" is damaged`);
  }

  res.writeHead(200, {
    "Content-Length": doc.ContentLength,
    "Content-Type": doc.ContentType,
    "Content-Disposition": shouldDownload
      ? `attachment; filename="${result.project.name}-speech.${result.object.extension}"`
      : "inline",
  });

  const stream = doc.Body as Readable;
  stream.pipe(res);
}

export default { videos, samples, speeches };
