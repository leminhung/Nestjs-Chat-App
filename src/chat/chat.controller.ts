import {
  Controller,
  Post,
  UseGuards,
  Param,
  ParseIntPipe,
  Body,
  Query,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../user/user.entity';
import { NotNullPipe } from '../auth/pipes/not-null.pipe';
import { FilterConversation } from './dto/filter-conversation.dto';
import { ConversationService } from './conversation.service';
import { CreateConversationDTO } from './dto/create-conversation.dto';
import { Get, ValidationPipe } from '@nestjs/common';
import { Conversation } from './conversation.entity';
import { MarkAsReadConversationDTO } from './dto/markAsRead.dto';
import {
  ApiTags,
  ApiParam,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('chat')
@UseGuards(AuthGuard())
@ApiTags('Chat Managment')
@ApiResponse({
  status: 401,
  description: 'Unauthorized',
})
@ApiBearerAuth()
export class ChatController {
  constructor(private conversationService: ConversationService) {}

  @Post(':receiverId/sendMessage')
  // @ApiParam({
  //   enumName: 'receiverId',
  //   type: Number,
  //   name: 'receiverId',
  // })
  @ApiBody({ type: String })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiOperation({
    summary: 'Send message to the specified ReceiverId uSER',
  })
  sendMessage(
    @GetUser() user: User,
    @Param('receiverId', ParseIntPipe) receiverId: number,
    @Body('message', NotNullPipe) message: string,
  ) {
    const createConversationDTO = new CreateConversationDTO();
    createConversationDTO.senderId = user.id;
    createConversationDTO.receiverId = receiverId;
    createConversationDTO.message = message;
    return this.conversationService.saveConversation(createConversationDTO);
  }

  @Get(':receiverId/messages')
  // @ApiParam({ name: 'receiverId', type: Number })
  @ApiOkResponse({ type: Conversation, isArray: true })
  @ApiOperation({
    summary:
      'Retrieve all messages of the current user with the receiverId user',
  })
  getMessages(
    @GetUser() user: User,
    @Param('receiverId', ParseIntPipe) receiverId: number,
    @Query() filter: FilterConversation,
  ) {
    return this.conversationService.getConversation(
      user.id,
      receiverId,
      filter,
    );
  }

  @Get('messages')
  @ApiOkResponse({ type: Conversation, isArray: true })
  @ApiOperation({ summary: 'Retrieve all messages of the current user' })
  getMyMessages(@GetUser() user: User, @Query() filter: FilterConversation) {
    return this.conversationService.getConversation(user.id, null, filter);
  }

  @Post(':receiverId/markAsRead')
  @ApiOperation({
    summary:
      'Mark all message before the current as read (in this conversation)',
  })
  markAsRead(@Body(ValidationPipe) conversation: MarkAsReadConversationDTO) {
    return this.conversationService.markAllBeforeAsRead(conversation);
  }

  @Delete('delete/:conversationId')
  @ApiQuery({ name: 'receiverId', type: Number })
  @ApiQuery({ name: 'conversationId', type: Number })
  @ApiOperation({ summary: 'Delete the Specified Message ' })
  delete(@Query(ParseIntPipe) conversationId: number, @GetUser() user: User) {
    return this.conversationService.deleteConversation(conversationId, user);
  }
}
