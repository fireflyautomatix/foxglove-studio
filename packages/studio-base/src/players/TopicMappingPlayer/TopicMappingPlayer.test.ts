// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { TopicMapper } from "@foxglove/studio";
import FakePlayer from "@foxglove/studio-base/components/MessagePipeline/FakePlayer";
import { TopicMappingPlayer } from "@foxglove/studio-base/players/TopicMappingPlayer/TopicMappingPlayer";
import { Topic } from "@foxglove/studio-base/players/types";

import { mockMessage, mockPlayerState } from "./mocks";

describe("TopicMappingPlayer", () => {
  it("maps subscriptions", async () => {
    const fakePlayer = new FakePlayer();
    const mappers: TopicMapper[] = [() => new Map([["/original_topic_1", "/renamed_topic_1"]])];
    const player = new TopicMappingPlayer(fakePlayer, mappers, {});
    player.setListener(async () => {});
    player.setSubscriptions([{ topic: "/renamed_topic_1" }, { topic: "/topic_2" }]);
    await fakePlayer.emit(
      mockPlayerState(undefined, {
        topics: [{ name: "/original_topic_1", schemaName: "any.schema" }],
      }),
    );
    expect(fakePlayer.subscriptions).toEqual([
      { topic: "/original_topic_1" },
      { topic: "/topic_2" },
    ]);
  });

  it("maps messages", async () => {
    const fakePlayer = new FakePlayer();
    const mappers: TopicMapper[] = [() => new Map([["original_topic_1", "renamed_topic_1"]])];
    const player = new TopicMappingPlayer(fakePlayer, mappers, {});
    const listener = jest.fn();
    player.setListener(listener);
    await fakePlayer.emit(
      mockPlayerState(undefined, {
        messages: [
          mockMessage("message", { topic: "original_topic_1" }),
          mockMessage("message", { topic: "topic_2" }),
        ],
        topics: [{ name: "original_topic_1", schemaName: "any.schema" }],
      }),
    );

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        activeData: expect.objectContaining({
          messages: [
            mockMessage("message", { topic: "renamed_topic_1" }),
            mockMessage("message", { topic: "topic_2" }),
          ],
          topics: [
            {
              name: "renamed_topic_1",
              mappedFromName: "original_topic_1",
              schemaName: "any.schema",
            },
          ],
        }),
      }),
    );
  });

  it("maps blocks", async () => {
    const fakePlayer = new FakePlayer();
    const mappers: TopicMapper[] = [() => new Map([["/topic_1", "/renamed_topic_1"]])];

    const player = new TopicMappingPlayer(fakePlayer, mappers, {});
    const listener = jest.fn();
    player.setListener(listener);

    const topics: Topic[] = [
      { name: "/topic_1", schemaName: "whatever" },
      { name: "/topic_2", schemaName: "whatever" },
    ];

    const state = mockPlayerState(
      {
        progress: {
          fullyLoadedFractionRanges: [],
          messageCache: {
            startTime: { sec: 0, nsec: 1 },
            blocks: [
              {
                messagesByTopic: {
                  "/topic_1": [mockMessage("message", { topic: "/topic_1" })],
                  "/topic_2": [mockMessage("message", { topic: "/topic_2" })],
                },
                sizeInBytes: 0,
              },
            ],
          },
        },
      },
      { topics },
    );
    await fakePlayer.emit(state);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        progress: {
          fullyLoadedFractionRanges: [],
          messageCache: {
            startTime: { sec: 0, nsec: 1 },
            blocks: [
              {
                messagesByTopic: {
                  "/renamed_topic_1": [expect.objectContaining({ topic: "/renamed_topic_1" })],
                  "/topic_2": [expect.objectContaining({ topic: "/topic_2" })],
                },
                sizeInBytes: 0,
              },
            ],
          },
        },
      }),
    );
  });
});
