package com.skillbridge.service;

import com.skillbridge.entity.Notification;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void notify(Long recipientId, Notification.Type type, String message, String link) {
        if (recipientId == null) {
            return;
        }
        Notification n = new Notification();
        n.setRecipientId(recipientId);
        n.setType(type);
        n.setMessage(message);
        n.setLink(link);
        notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public List<Notification> recent(Long recipientId) {
        return notificationRepository.findTop50ByRecipientIdOrderByCreatedAtDesc(recipientId);
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long recipientId) {
        return notificationRepository.countByRecipientIdAndReadFalse(recipientId);
    }

    @Transactional
    public void markRead(Long recipientId, Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        if (!n.getRecipientId().equals(recipientId)) {
            throw new AccessDeniedException("Not your notification");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead(Long recipientId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndReadFalse(recipientId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
