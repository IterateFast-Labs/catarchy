import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '@providers/database/database.service';
import { letter } from 'prisma/db';
import { PaginationResponse } from 'src/types';

@Injectable()
export class LetterService {
  constructor(private readonly db: DatabaseService) {}

  public async sendLetter(
    senderId: number,
    receiverHandle: string,
    content: string,
    title?: string,
  ) {
    const receiver = await this.db.user.findUnique({
      where: { handle: receiverHandle },
    });

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    const letter = await this.db.letter.create({
      data: {
        senderId,
        receiverId: receiver.id,
        title: title ?? '[No title]',
        content,
      },
    });

    return {
      id: letter.id,
    };
  }

  public async getReceivedLetters(
    userId: number,
    page: number = 1,
    size: number = 10,
  ): Promise<
    PaginationResponse<
      Partial<letter> & {
        sender: string | null;
        receiver: string | null;
      }
    >
  > {
    const letters = await this.db.letter.findMany({
      where: {
        deletedAt: null,
        receiverId: userId,
      },
      orderBy: {
        sentAt: 'desc',
      },
      skip: (page - 1) * size,
      take: size,
      include: {
        sender: {
          select: {
            handle: true,
          },
        },
        receiver: {
          select: {
            handle: true,
          },
        },
      },
    });

    const totalCount = await this.db.letter.count({
      where: {
        deletedAt: null,
        receiverId: userId,
      },
    });

    const parsedLetters = letters.map((letter) => ({
      id: letter.id,
      sender: letter.sender?.handle,
      receiver: letter.receiver?.handle,
      title: letter.title,
      content: letter.content,
      sentAt: letter.sentAt,
      readAt: letter.readAt,
    }));

    return {
      list: parsedLetters,
      totalCount,
    };
  }

  public async getSentLetters(
    userId: number,
    page: number = 1,
    size: number = 10,
  ): Promise<
    PaginationResponse<
      Partial<letter> & { receiver: string | null; sender: string | null }
    >
  > {
    const letters = await this.db.letter.findMany({
      where: {
        senderId: userId,
      },
      orderBy: {
        sentAt: 'desc',
      },
      skip: (page - 1) * size,
      take: size,
      include: {
        receiver: {
          select: {
            handle: true,
          },
        },
        sender: {
          select: {
            handle: true,
          },
        },
      },
    });

    const totalCount = await this.db.letter.count({
      where: {
        senderId: userId,
      },
    });

    const parsedLetters = letters.map((letter) => ({
      id: letter.id,
      sender: letter.sender?.handle,
      receiver: letter.receiver?.handle,
      title: letter.title,
      content: letter.content,
      sentAt: letter.sentAt,
    }));

    return {
      list: parsedLetters,
      totalCount,
    };
  }

  public async getLetter(
    letterId: string,
    userId: number,
  ): Promise<
    Partial<letter> & { sender: string | null; receiver: string | null }
  > {
    const letter = await this.db.letter.findUnique({
      where: { id: letterId },
      include: {
        sender: {
          select: {
            handle: true,
          },
        },
        receiver: {
          select: {
            handle: true,
          },
        },
      },
    });

    if (!letter) {
      throw new NotFoundException('Letter not found');
    }

    if (letter.senderId !== userId && letter.receiverId !== userId) {
      throw new ForbiddenException('You are not allowed to access this letter');
    }

    if (!letter.readAt) {
      await this.db.letter.update({
        where: { id: letterId },
        data: { readAt: new Date() },
      });
    }

    const response: Partial<letter> & {
      sender: string | null;
      receiver: string | null;
    } = {
      id: letter.id,
      sender: letter.sender?.handle,
      receiver: letter.receiver?.handle,
      title: letter.title,
      content: letter.content,
      sentAt: letter.sentAt,
    };

    if (letter.receiverId === userId) {
      response.readAt = letter.readAt;
    }

    return {
      ...response,
    };
  }

  public async getUnreadLetterCount(userId: number) {
    const count = await this.db.letter.count({
      where: { receiverId: userId, readAt: null, deletedAt: null },
    });

    return {
      count,
    };
  }

  public async deleteLetter(letterId: string, userId: number) {
    const letter = await this.db.letter.findUnique({
      where: { id: letterId, receiverId: userId, deletedAt: null },
    });

    if (!letter) {
      throw new NotFoundException('Letter not found');
    }

    await this.db.letter.update({
      where: { id: letterId },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
