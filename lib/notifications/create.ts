import { createClient } from '@/lib/supabase/server';
import { CreateNotificationData, Notification, NotificationType } from './types';

/**
 * Create a single notification
 */
export async function createNotification(data: CreateNotificationData): Promise<Notification> {
  const supabase = await createClient();
  
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata || {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }

  return notification;
}

/**
 * Create notifications for multiple users
 */
export async function createNotificationsForUsers(
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Record<string, any>
): Promise<Notification[]> {
  const supabase = await createClient();
  
  const notifications = userIds.map(userId => ({
    user_id: userId,
    type,
    title,
    message,
    metadata: metadata || {},
  }));

  const { data, error } = await supabase
    .from('notifications')
    .insert(notifications)
    .select();

  if (error) {
    throw new Error(`Failed to create notifications: ${error.message}`);
  }

  return data;
}

/**
 * Create a match notification for both users
 */
export async function createMatchNotification(
  userAId: string,
  userBId: string,
  type: 'match_created' | 'match_accepted' | 'match_confirmed',
  matchId: string,
  chatId?: string
): Promise<void> {
  const supabase = await createClient();
  
  // Get user names for personalized messages
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, first_name')
    .in('user_id', [userAId, userBId]);

  const userAName = profiles?.find(p => p.user_id === userAId)?.first_name || 'Someone';
  const userBName = profiles?.find(p => p.user_id === userBId)?.first_name || 'Someone';

  let title: string;
  let messageA: string;
  let messageB: string;
  let metadata: Record<string, any>;

  switch (type) {
    case 'match_created':
      title = 'New Match Found!';
      messageA = `You have a new match with ${userBName}! Check out their profile.`;
      messageB = `You have a new match with ${userAName}! Check out their profile.`;
      metadata = { match_id: matchId, chat_id: chatId };
      break;
    case 'match_accepted':
      title = 'Match Accepted!';
      messageA = `${userBName} accepted your match request!`;
      messageB = `${userAName} accepted your match request!`;
      metadata = { match_id: matchId };
      break;
    case 'match_confirmed':
      title = 'Match Confirmed!';
      messageA = `It's official! You and ${userBName} are now matched.`;
      messageB = `It's official! You and ${userAName} are now matched.`;
      metadata = { match_id: matchId, chat_id: chatId };
      break;
  }

  // Create notifications for both users
  await createNotificationsForUsers(
    [userAId, userBId],
    type,
    title,
    messageA, // We'll update this per user below
    metadata
  );

  // Update the second user's message
  await supabase
    .from('notifications')
    .update({ message: messageB })
    .eq('user_id', userBId)
    .eq('type', type)
    .eq('metadata->match_id', matchId);
}

/**
 * Create a group match notification
 */
export async function createGroupMatchNotification(
  memberIds: string[],
  groupId: string,
  chatId: string
): Promise<void> {
  const title = 'Group Match Confirmed!';
  const message = `Your group match is confirmed! You can now chat with your ${memberIds.length - 1} potential roommates.`;
  const metadata = { group_id: groupId, chat_id: chatId, member_count: memberIds.length };

  await createNotificationsForUsers(memberIds, 'match_confirmed', title, message, metadata);
}

/**
 * Create a chat message notification
 */
export async function createChatMessageNotification(
  recipientId: string,
  senderName: string,
  chatId: string,
  messagePreview: string
): Promise<void> {
  const title = 'New Message';
  const message = `${senderName}: ${messagePreview}`;
  const metadata = { chat_id: chatId, sender_name: senderName };

  await createNotification({
    user_id: recipientId,
    type: 'chat_message',
    title,
    message,
    metadata,
  });
}

/**
 * Create a profile update notification
 */
export async function createProfileUpdateNotification(
  userId: string,
  updateType: string
): Promise<void> {
  const title = 'Profile Updated';
  const message = `Your profile has been updated: ${updateType}`;
  const metadata = { update_type: updateType };

  await createNotification({
    user_id: userId,
    type: 'profile_updated',
    title,
    message,
    metadata,
  });
}

/**
 * Create a questionnaire completion notification
 */
export async function createQuestionnaireCompletionNotification(
  userId: string
): Promise<void> {
  const title = 'Questionnaire Complete!';
  const message = 'Great! Your questionnaire is complete. We\'re finding matches for you.';
  const metadata = { completed_at: new Date().toISOString() };

  await createNotification({
    user_id: userId,
    type: 'questionnaire_completed',
    title,
    message,
    metadata,
  });
}

/**
 * Create a verification status notification
 */
export async function createVerificationStatusNotification(
  userId: string,
  status: 'verified' | 'failed',
  message?: string
): Promise<void> {
  const title = status === 'verified' ? 'Verification Complete!' : 'Verification Required';
  const defaultMessage = status === 'verified' 
    ? 'Your verification is complete! You can now access all features.'
    : 'Your verification requires attention. Please check your documents.';
  
  const notificationMessage = message || defaultMessage;
  const metadata = { verification_status: status };

  await createNotification({
    user_id: userId,
    type: 'verification_status',
    title,
    message: notificationMessage,
    metadata,
  });
}

/**
 * Create a system announcement notification
 */
export async function createSystemAnnouncementNotification(
  userIds: string[],
  title: string,
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  await createNotificationsForUsers(
    userIds,
    'system_announcement',
    title,
    message,
    metadata
  );
}
