using MediatR;
using EventManagement.Domain.Interfaces;

namespace EventManagement.Application.Commands.CancelEvent;

public class CancelEventCommandHandler : IRequestHandler<CancelEventCommand, bool>
{
    private readonly IEventRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CancelEventCommandHandler(IEventRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(CancelEventCommand request, CancellationToken cancellationToken)
    {
        var orgEvent = await _repository.GetByIdAsync(request.EventId, cancellationToken);
        if (orgEvent is null) return false;

        orgEvent.Cancel(request.Reason);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
