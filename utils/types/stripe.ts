export enum StripeEvents {
    checkoutSessionCompleted = 'checkout.session.completed',
    customerSubscriptionDeleted = 'customer.subscription.deleted',
    customerSubscriptionUpdated = 'customer.subscription.updated',
    invoicePaymentSucceeded = 'invoice.payment_succeeded',
}

export enum StripeEventsReasons {
    cancellationRequested = 'cancellation_requested',
    subscriptionCycle = 'subscription_cycle',
}