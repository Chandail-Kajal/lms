import { EventPayloadMap } from "@/types";
import EventEmitter from "events"
import { logger } from "./logger";
type EventHandler<T> = (payload: T) => void | Promise<void>;

class TypedEventBus {
    private emitter = new EventEmitter();

    on<K extends keyof EventPayloadMap>(
        event: K,
        handler: EventHandler<EventPayloadMap[K]>
    ) {
        logger.debug(`[EventEmitter]: handling event ${event}`)
        this.emitter.on(event, handler);
    }

    once<K extends keyof EventPayloadMap>(
        event: K,
        handler: EventHandler<EventPayloadMap[K]>
    ) {
        this.emitter.once(event, handler);
    }

    emit<K extends keyof EventPayloadMap>(
        event: K,
        payload: EventPayloadMap[K]
    ) {
        logger.debug(`[EventEmitter]: emitting new event ${event}`)
        this.emitter.emit(event, payload);
    }

    off<K extends keyof EventPayloadMap>(
        event: K,
        handler: EventHandler<EventPayloadMap[K]>
    ) {
        this.emitter.off(event, handler);
    }
}

export const eventBus = new TypedEventBus();