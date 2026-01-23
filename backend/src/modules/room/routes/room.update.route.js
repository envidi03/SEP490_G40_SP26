const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const roomController = require('../controllers/room.controller');

/**
 * @swagger
 * /rooms/{roomId}:
 *   patch:
 *     summary: Update room details by ID
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the room to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               room_number:
 *                 type: string
 *                 example: "room 101"
 *               status:
 *                 type: string
 *                 example: "ACTIVE"
 *               note:
 *                 type: string
 *                 example: "room 101"
 *     responses:
 *       200:
 *         description: Room updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Room 6971de975524e37b724498d7 updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "6971de975524e37b724498d7"
 *                     room_number:
 *                       type: string
 *                       example: "room 101"
 *                     status:
 *                       type: string
 *                       example: "ACTIVE"
 *                     clinic_id:
 *                       type: string
 *                       example: "696edbf3b3f056e62cee450c"
 *                     history_used:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-22T08:23:51.778Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-23T03:13:21.604Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *                     note:
 *                       type: string
 *                       example: "room 101"
 *       400:
 *         description: Bad Request - No update data provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "No update data provided"
 *                 stack:
 *                   type: string
 *                   example: "BadRequestError: No update data provided at updateRoom (/path/to/controller.js:194:19)"
 *       409:
 *         description: Conflict - Room number already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Room number room 104 already exists"
 *                 stack:
 *                   type: string
 *                   example: "ConflictError: Room number room 104 already exists at updateRoom (/path/to/controller.js:203:19)"
 */

router.patch('/:roomId', auth.authenticate, auth.authorize("ADMIN_CLINIC"), roomController.updateRoom);

module.exports = router;