import asyncHandler from 'express-async-handler';
import { Device } from '../models/Device.js';

export const listDevices = asyncHandler(async (_req,res)=> {
  res.json(await Device.find().sort({createdAt:-1}).lean());
});
export const createDevice = asyncHandler(async (req,res)=> {
  const { name, kind, meta, userId } = req.body || {};
  if (!name) return res.status(400).json({ message:'name is required' });
  const device = await Device.create({ name, kind, meta, userId });
  res.status(201).json(device);
});
export const getDevice = asyncHandler(async (req,res)=> {
  const d = await Device.findById(req.params.id);
  if (!d) return res.status(404).json({ message:'Device not found' });
  res.json(d);
});
export const updateDevice = asyncHandler(async (req,res)=> {
  const d = await Device.findByIdAndUpdate(req.params.id, req.body, { new:true });
  if (!d) return res.status(404).json({ message:'Device not found' });
  res.json(d);
});
export const deleteDevice = asyncHandler(async (req,res)=> {
  const d = await Device.findById(req.params.id);
  if (!d) return res.status(404).json({ message:'Device not found' });
  await d.deleteOne();
  res.json({ ok:true });
});
