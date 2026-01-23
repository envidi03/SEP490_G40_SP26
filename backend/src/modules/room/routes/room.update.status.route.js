const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const roomController = require('../controllers/room.controller');

/**
 * @swagger
 * /rooms/{roomId}/status:
 *   patch:
 *     summary: Update the status of a room by ID
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
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, MAINTENANCE]
 *                 example: "INACTIVE"
 *     responses:
 *       200:
 *         description: Room status updated successfully
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
 *                   example: "Room 6971deb35524e37b724498e3 status updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "6971deb35524e37b724498e3"
 *                     room_number:
 *                       type: string
 *                       example: "room 102"
 *                     status:
 *                       type: string
 *                       example: "INACTIVE"
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
 *                       example: "2026-01-22T08:24:19.146Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-23T03:23:49.445Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *                     note:
 *                       type: string
 *                       example: "room 102"
 *       400:
 *         description: Bad Request - Invalid or missing status
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
 *                   example: "Invalid status value. Must be one of: ACTIVE, INACTIVE, MAINTENANCE"
 *                 stack:
 *                   type: string
 *                   example: "BadRequestError: Invalid status value. Must be one of: ACTIVE, INACTIVE, MAINTENANCE at updateRoomStatus (/path/to/controller.js:260:19)"
 *       400:
 *         description: Bad Request - No status provided
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
 *                   example: "No status provided"
 *                 stack:
 *                   type: string
 *                   example: "BadRequestError: No status provided at updateRoomStatus (/path/to/controller.js:250:19)"
 */

router.patch('/:roomId', auth.authenticate, auth.authorize("ADMIN_CLINIC"), roomController.updateRoomStatus);

module.exports = router;