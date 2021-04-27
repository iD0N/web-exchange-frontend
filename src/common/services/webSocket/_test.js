// import { combineReducers } from 'redux';
// import { expectSaga } from 'redux-saga-test-plan';

// import webSocket, {
//   SEND_MESSAGE,
//   subscribeAction,
//   unsubscribeAction,
//   sendMessageAction,
//   openSocketActions,
//   closeSocketAction,
//   webSocketSaga,
// } from './';
// import { CONNECTION_STATUS } from './constants';

// const rootReducer = combineReducers({ webSocket });

// describe('service/websocket/index.js', () => {
//   const key = 'channel-contractCode';
//   const data = {
//     channels: ['channel'],
//     contractCodes: ['contractCode'],
//   };

//   describe('subscribe action', () => {
//     describe('when socket is opened', () => {
//       const createSaga = (state = {}) =>
//         expectSaga(webSocketSaga).withReducer(rootReducer, {
//           webSocket: { status: CONNECTION_STATUS.OPEN, subscriptions: {}, pending: [], ...state },
//         });

//       it('should increment subscribers count', () =>
//         createSaga()
//           .hasFinalState({
//             webSocket: {
//               status: CONNECTION_STATUS.OPEN,
//               subscriptions: {
//                 [key]: 3,
//               },
//               pending: [],
//             },
//           })
//           .dispatch(subscribeAction({ key }))
//           .dispatch(subscribeAction({ key }))
//           .dispatch(subscribeAction({ key }))
//           .run());

//       it('should send subscribe message on first subscribe', () =>
//         createSaga()
//           .put(
//             sendMessageAction({
//               type: 'subscribe',
//               ...data,
//             })
//           )
//           .dispatch(subscribeAction({ key, data }))
//           .run());

//       it('should not send message on second subscribe', () =>
//         createSaga({ subscriptions: { 'channel-contractCode': 1 } })
//           .not.put.actionType(SEND_MESSAGE)
//           .dispatch(subscribeAction({ key }))
//           .run());
//     });

//     describe('when socket is closed', () => {
//       const createSaga = (state = {}) =>
//         expectSaga(webSocketSaga).withReducer(rootReducer, {
//           webSocket: { status: CONNECTION_STATUS.CLOSED, subscriptions: {}, pending: [], ...state },
//         });

//       it('should increment subscribers count', () =>
//         createSaga()
//           .hasFinalState({
//             webSocket: {
//               status: CONNECTION_STATUS.CLOSED,
//               subscriptions: {
//                 'channel-contractCode': 3,
//               },
//               pending: [{ type: 'subscribe' }],
//             },
//           })
//           .dispatch(subscribeAction({ key }))
//           .dispatch(subscribeAction({ key }))
//           .dispatch(subscribeAction({ key }))
//           .run());

//       it('should store message in pending', () =>
//         createSaga()
//           .put(
//             sendMessageAction({
//               type: 'subscribe',
//               ...data,
//             })
//           )
//           .hasFinalState({
//             webSocket: {
//               status: CONNECTION_STATUS.CLOSED,
//               subscriptions: {
//                 [key]: 1,
//               },
//               pending: [
//                 {
//                   type: 'subscribe',
//                   ...data,
//                 },
//               ],
//             },
//           })
//           .dispatch(subscribeAction({ key, data }))
//           .run());

//       describe('when changed to opened', () => {
//         const key2 = 'channel2-contractCode2';
//         const data2 = {
//           channels: ['channel2'],
//           contractCodes: ['contractCode2'],
//         };

//         it('should send pending messages when opened', () =>
//           createSaga()
//             .put(
//               sendMessageAction({
//                 type: 'subscribe',
//                 ...data,
//               })
//             )
//             .put(
//               sendMessageAction({
//                 type: 'subscribe',
//                 ...data2,
//               })
//             )
//             .hasFinalState({
//               webSocket: {
//                 status: CONNECTION_STATUS.OPEN,
//                 subscriptions: {
//                   [key]: 1,
//                   [key2]: 1,
//                 },
//                 pending: [],
//               },
//             })
//             .dispatch(openSocketActions.success())
//             .dispatch(subscribeAction({ key, data }))
//             .dispatch(subscribeAction({ key: key2, data: data2 }))
//             .run());
//       });
//     });
//   });

//   describe('unsubscribe action', () => {
//     const createSaga = (state = {}) =>
//       expectSaga(webSocketSaga).withReducer(rootReducer, {
//         webSocket: {
//           status: CONNECTION_STATUS.OPEN,
//           subscriptions: {
//             'channel-contractCode': 2,
//           },
//           pending: [],
//           ...state,
//         },
//       });

//     it('should decrement subscribers', () =>
//       createSaga()
//         .hasFinalState({
//           webSocket: {
//             status: CONNECTION_STATUS.OPEN,
//             subscriptions: {
//               'channel-contractCode': 1,
//             },
//             pending: [],
//           },
//         })
//         .dispatch(unsubscribeAction({ key }))
//         .run());

//     it('should not send unsubscribe message when has remaining subscriptions', () =>
//       createSaga()
//         .not.put.actionType(SEND_MESSAGE)
//         .dispatch(unsubscribeAction({ key }))
//         .run());

//     it('should send unsubscribe message when has 0 remaining subscriptions', () =>
//       createSaga()
//         .put.actionType(SEND_MESSAGE)
//         .hasFinalState({
//           webSocket: {
//             status: CONNECTION_STATUS.OPEN,
//             subscriptions: {
//               'channel-contractCode': 0,
//             },
//             pending: [],
//           },
//         })
//         .dispatch(unsubscribeAction({ key }))
//         .dispatch(unsubscribeAction({ key }))
//         .run());
//   });

//   describe('close action', () => {
//     const uri = 'uri';

//     it('closes the websocket', () =>
//       expectSaga(webSocketSaga)
//         .dispatch(openSocketActions.request({ uri }))
//         .dispatch(closeSocketAction())
//         .run()
//         .then(() => expect(window.WebSocket.closeMock).toBeCalled()));
//   });
// });
