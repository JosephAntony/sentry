from __future__ import absolute_import

__all__ = ['Integration']

import logging


class Integration(object):
    """
    An integration describes a third party that can be registered within Sentry.

    The core behavior is simply how to add the integration (the authentication
    pipeline), and what kind of configuration is stored.

    This is similar to Sentry's legacy 'plugin' information, except that an
    integration is lives as an instance in the database, and the ``Integration``
    class is just a descriptor for how that object functions, and what behavior
    it provides (such as extensions provided).
    """

    # a unique identifier (e.g. 'slack')
    id = None

    # a human readable name (e.g. 'Slack')
    name = None

    # configuration for the setup dialog
    setup_dialog_config = {
        'width': 600,
        'height': 600,
    }

    def get_logger(self):
        return logging.getLogger('sentry.integration.%s' % (self.get_id(), ))

    def get_pipeline(self):
        """
        Return a list of ``View`` instances describing this integration's
        configuration pipeline.

        >>> def get_pipeline(self):
        >>>    return []
        """
        raise NotImplementedError

    def get_identity_pipeline(self):
        """
        Return a list of ``View`` instances describing this integration's
        identity-association pipeline. This is optional, and only needed
        when a service provider needs account-linked identities (not just a
        single associate for the provider itself).

        >>> def get_pipeline(self):
        >>>    return []
        """
        raise NotImplementedError

    # XXX(dcramer): this is not yet exposed anywhere in the UI
    def get_config(self):
        """
        Return a list of configuration attributes for this integration.

        The results of this are stored per-organization per-integration.

        >>> def get_config(self):
        >>>     return [{
        >>>         'name': 'instance',
        >>>         'label': 'Instance',
        >>>         'type': 'text',
        >>>         'placeholder': 'e.g. https://example.atlassian.net',
        >>>         'required': True,
        >>>     }]
        """
        return []

    def is_configured(self):
        """
        Return a boolean describing whether this integration should be made
        available (e.g. per system-configuration).
        """
        return True

    def build_integration(self, state):
        """
        Given state captured during the setup pipeline, return a dictionary
        of configuration and metadata to store with this integration.

        This data **must not** be specific to an organization, as the
        integration may be shared among multiple organizations.

        This is the ideal place to store metadata like the 'name' or 'url' to
        the relevant entity, or shared API keys.

        This **must** return an 'external_id' attribute.

        This **should** return a 'name' attribute.

        >>> def build_integration(self, state):
        >>>     return {
        >>>         'external_id': state['id'],
        >>>         'name': state['name'],
        >>>         'metadata': {url': state['url']},
        >>>     }
        """
        raise NotImplementedError

    def setup(self):
        """
        Executed once Sentry has been initialized at runtime.

        >>> def setup(self):
        >>>     bindings.add('repository.provider', GitHubRepositoryProvider, id='github')
        """