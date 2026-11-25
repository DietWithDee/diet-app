const toIsoString = (val) => {
    if (!val) return null;
    if (typeof val.toDate === "function") return val.toDate().toISOString();
    if (typeof val === "string") {
        const parsed = new Date(val);
        return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
    }
    const parsed = new Date(val);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const sanitizePortalBooking = (docSnap) => {
    const data = typeof docSnap.data === "function" ? (docSnap.data() || {}) : (docSnap.data || {});
    return {
        id: docSnap.id,
        name: data.name || null,
        email: data.email || null,
        consultationType: data.consultationType || "initial",
        amount: data.amount ?? null,
        paystackReference: data.paystackReference || docSnap.id,
        status: data.status || "pending",
        scheduledDate: data.scheduledDate || null,
        scheduledTime: data.scheduledTime || null,
        isOntrack: !!data.isOntrack,
        source: data.source || null,
        isFathersDayBooking: !!data.isFathersDayBooking,
        fatherName: data.fatherName || null,
        message: data.message || null,
        clientCareNote: data.clientCareNote || null,
        carePlanUrl: data.carePlanUrl || null,
        userResults: data.userResults || null,
        createdAt: toIsoString(data.createdAt),
        updatedAt: toIsoString(data.updatedAt),
        careNoteUpdatedAt: toIsoString(data.careNoteUpdatedAt)
    };
};

const sanitizePortalInquiry = (docSnap) => {
    const data = typeof docSnap.data === "function" ? (docSnap.data() || {}) : (docSnap.data || {});
    return {
        id: docSnap.id,
        inquiryTopic: data.inquiryTopic || "Custom & Specialist Care",
        message: data.message || "",
        status: data.status || "new",
        createdAt: toIsoString(data.createdAt)
    };
};

const mergeDocsById = (snapshots, mapFn) => {
    const map = new Map();
    snapshots.forEach((snap) => {
        if (!snap) return;
        if (Array.isArray(snap.docs)) {
            snap.docs.forEach((docSnap) => {
                if (docSnap.exists && !map.has(docSnap.id)) {
                    map.set(docSnap.id, mapFn(docSnap));
                }
            });
        } else if (snap.exists && !map.has(snap.id)) {
            map.set(snap.id, mapFn(snap));
        }
    });
    return Array.from(map.values()).sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
    });
};

const verifyBookingLinkEligibility = ({ bookingData, uid, cleanEmail, emailVerified, phoneLast4 }) => {
    const data = bookingData || {};
    if (data.userId && data.userId !== uid) {
        return { ok: false, message: "This booking is already linked to a different account." };
    }

    const cleanLast4 = String(phoneLast4 || "").replace(/\D/g, "").slice(-4);
    if (cleanLast4.length !== 4) {
        return {
            ok: false,
            message: "Enter the last 4 digits of the phone number used when booking."
        };
    }

    const bookingEmail = (data.emailLower || data.email || "").trim().toLowerCase();
    const rawPhone = data.phone || data.buyerPhone || "";
    const bookingPhoneDigits = String(rawPhone).replace(/\D/g, "");
    const emailMatches = !!emailVerified && !!cleanEmail && bookingEmail === cleanEmail;
    const phoneMatches = bookingPhoneDigits.length >= 4 && bookingPhoneDigits.slice(-4) === cleanLast4;

    if (!emailMatches && !phoneMatches) {
        return {
            ok: false,
            message: "Those last 4 phone digits do not match this booking record."
        };
    }

    return { ok: true };
};

module.exports = {
    toIsoString,
    sanitizePortalBooking,
    sanitizePortalInquiry,
    mergeDocsById,
    verifyBookingLinkEligibility
};
