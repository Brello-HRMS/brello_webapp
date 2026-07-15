import { useState } from 'react';
import { Send } from 'lucide-react';

import { Button } from '../../../../components/common';
import { useOfferMessages, useSendOfferMessage } from '../../hooks/useOffers';

import styles from './OfferMessages.module.scss';

export const OfferMessages = ({ offerId }: { offerId: string }) => {
  const { data: response, isLoading } = useOfferMessages(offerId);
  const messages = response?.data ?? [];
  const { mutate: sendMessage, isPending } = useSendOfferMessage(offerId);
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(
      { message: text },
      {
        onSuccess: () => setText(''),
      },
    );
  };

  if (isLoading) return <div className={styles.loading}>Loading messages...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.messageList}>
        {messages.length === 0 ? (
          <div className={styles.empty}>No messages yet.</div>
        ) : (
          messages.map((msg: Record<string, unknown>) => (
            <div
              key={msg.id as string}
              className={`${styles.message} ${msg.sender_type === 'hr' ? styles.hr : styles.candidate}`}
            >
              <div className={styles.meta}>
                <span className={styles.name}>{msg.sender_name as string}</span>
                <span className={styles.time}>
                  {new Date(msg.created_at as string).toLocaleString()}
                </span>
              </div>
              <div className={styles.bubble}>{msg.message as string}</div>
            </div>
          ))
        )}
      </div>

      <div className={styles.inputArea}>
        <textarea
          className={styles.textarea}
          placeholder="Type a message to the candidate..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button variant="primary" onClick={handleSend} disabled={isPending || !text.trim()}>
          <Send size={15} /> Send
        </Button>
      </div>
    </div>
  );
};
