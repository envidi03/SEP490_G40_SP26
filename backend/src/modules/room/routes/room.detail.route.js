const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const roomController = require('../controllers/room.controller');

/**
 * @swagger
 * /rooms/{roomId}:
 *   get:
 *     summary: Get room details by ID
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the room to retrieve
 *     responses:
 *       200:
 *         description: Room retrieved successfully
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
 *                   example: "Room retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "6971ef4c78f86b8dc39921a3"
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
 *                     history_used:
 *                       type: object
 *                       properties:
 *                         item:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: []
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             page:
 *                               type: integer
 *                               example: 1
 *                             size:
 *                               type: integer
 *                               example: 5
 *                             totalItems:
 *                               type: integer
 *                               example: 0
 *                             totalPages:
 *                               type: integer
 *                               example: 0
 */

router.get('/:roomId', auth.authenticate, auth.authorize("ADMIN_CLINIC"), roomController.getRoomById);

module.exports = router;