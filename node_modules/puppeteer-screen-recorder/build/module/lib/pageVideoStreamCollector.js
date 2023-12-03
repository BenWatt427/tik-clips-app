import { EventEmitter } from 'events';
/**
 * @ignore
 */
export class pageVideoStreamCollector extends EventEmitter {
    constructor(page, options) {
        super();
        this.sessionsStack = [];
        this.isStreamingEnded = false;
        this.page = page;
        this.options = options;
    }
    get shouldFollowPopupWindow() {
        return this.options.followNewTab;
    }
    async getPageSession(page) {
        try {
            const context = page.target();
            return await context.createCDPSession();
        }
        catch (error) {
            console.log('Failed to create CDP Session', error);
            return null;
        }
    }
    getCurrentSession() {
        return this.sessionsStack[this.sessionsStack.length - 1];
    }
    addListenerOnTabOpens(page) {
        page.on('popup', (newPage) => this.registerTabListener(newPage));
    }
    removeListenerOnTabClose(page) {
        page.off('popup', (newPage) => this.registerTabListener(newPage));
    }
    async registerTabListener(newPage) {
        await this.startSession(newPage);
        newPage.once('close', async () => await this.endSession());
    }
    async startScreenCast(shouldDeleteSessionOnFailure = false) {
        const currentSession = this.getCurrentSession();
        const quality = Number.isNaN(this.options.quality)
            ? 100
            : Math.max(Math.min(this.options.quality, 100), 0);
        try {
            await currentSession.send('Animation.setPlaybackRate', {
                playbackRate: 1,
            });
            await currentSession.send('Page.startScreencast', {
                everyNthFrame: 1,
                format: this.options.format || 'jpeg',
                quality: quality,
            });
        }
        catch (e) {
            if (shouldDeleteSessionOnFailure) {
                this.endSession();
            }
        }
    }
    async stopScreenCast() {
        const currentSession = this.getCurrentSession();
        if (!currentSession) {
            return;
        }
        await currentSession.send('Page.stopScreencast');
    }
    async startSession(page) {
        const pageSession = await this.getPageSession(page);
        if (!pageSession) {
            return;
        }
        await this.stopScreenCast();
        this.sessionsStack.push(pageSession);
        this.handleScreenCastFrame(pageSession);
        await this.startScreenCast(true);
    }
    async handleScreenCastFrame(session) {
        this.isFrameAckReceived = new Promise((resolve) => {
            session.on('Page.screencastFrame', async ({ metadata, data, sessionId }) => {
                if (!metadata.timestamp || this.isStreamingEnded) {
                    return resolve();
                }
                const ackPromise = session.send('Page.screencastFrameAck', {
                    sessionId: sessionId,
                });
                this.emit('pageScreenFrame', {
                    blob: Buffer.from(data, 'base64'),
                    timestamp: metadata.timestamp,
                });
                try {
                    await ackPromise;
                }
                catch (error) {
                    console.error('Error in sending Acknowledgment for PageScreenCast', error.message);
                }
            });
        });
    }
    async endSession() {
        this.sessionsStack.pop();
        await this.startScreenCast();
    }
    async start() {
        await this.startSession(this.page);
        this.page.once('close', async () => await this.endSession());
        if (this.shouldFollowPopupWindow) {
            this.addListenerOnTabOpens(this.page);
        }
    }
    async stop() {
        if (this.isStreamingEnded) {
            return this.isStreamingEnded;
        }
        if (this.shouldFollowPopupWindow) {
            this.removeListenerOnTabClose(this.page);
        }
        await Promise.race([
            this.isFrameAckReceived,
            new Promise((resolve) => setTimeout(resolve, 1000)),
        ]);
        this.isStreamingEnded = true;
        try {
            for (const currentSession of this.sessionsStack) {
                await currentSession.detach();
            }
        }
        catch (e) {
            console.warn('Error detaching session', e.message);
        }
        return true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZVZpZGVvU3RyZWFtQ29sbGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9wYWdlVmlkZW9TdHJlYW1Db2xsZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFFBQVEsQ0FBQztBQU10Qzs7R0FFRztBQUNILE1BQU0sT0FBTyx3QkFBeUIsU0FBUSxZQUFZO0lBUXhELFlBQVksSUFBVSxFQUFFLE9BQXVDO1FBQzdELEtBQUssRUFBRSxDQUFDO1FBTkYsa0JBQWEsR0FBa0IsRUFBRSxDQUFDO1FBQ2xDLHFCQUFnQixHQUFHLEtBQUssQ0FBQztRQU0vQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN6QixDQUFDO0lBRUQsSUFBWSx1QkFBdUI7UUFDakMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQztJQUNuQyxDQUFDO0lBRU8sS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFVO1FBQ3JDLElBQUk7WUFDRixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDOUIsT0FBTyxNQUFNLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1NBQ3pDO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ25ELE9BQU8sSUFBSSxDQUFDO1NBQ2I7SUFDSCxDQUFDO0lBRU8saUJBQWlCO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRU8scUJBQXFCLENBQUMsSUFBVTtRQUN0QyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sRUFB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