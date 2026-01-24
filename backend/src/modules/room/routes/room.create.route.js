const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const roomController = require('../controllers/room.controller');

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Create a new room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               room_number:
 *                 type: string
 *                 example: "room 104"
 *               status:
 *                 type: string
 *                 example: "ACTIVE"
 *               note:
 *                 type: string
 *                 example: "room 104"
 *               clinic_id:
 *                 type: string
 *                 example: "696edbf3b3f056e62cee450c"
 *     responses:
 *       201:
 *         description: Room created successfully
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
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Room created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     room_number:
 *                       type: string
 *                       example: "room 104"
 *                     status:
 *                       type: string
 *                       example: "ACTIVE"
 *                     note:
 *                       type: string
 *                       example: "room 104"
 *                     clinic_id:
 *                       type: string
 *                       example: "696edbf3b3f056e62cee450c"
 *                     _id:
 *                       type: string
 *                       example: "6971ef4c78f86b8dc39921a3"
 *                     history_used:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-22T09:35:08.558Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-22T09:35:08.558Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *       400:
 *         description: Bad Request - Invalid input
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
 *                   example: "Room number is required"
 *                 stack:
 *                   type: string
 *                   example: "BadRequestError: Room number is required at createRoom (/path/to/controller.js:91:19)"
 *       409:
 *         description: Conflict - Resource already exists
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
 *                   example: "Room number room 103 already exists"
 *                 stack:
 *                   type: string
 *                   example: "ConflictError: Room number room 103 already exists at createRoom (/path/to/controller.js:99:19)"
 */

router.post('/', auth.authenticate, auth.authorize("ADMIN_CLINIC"), roomController.createRoom);

module.exports = router;