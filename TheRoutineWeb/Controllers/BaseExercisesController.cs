using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using TheRoutineWeb.Data;
using TheRoutineWeb.Models;

namespace TheRoutineWeb.Controllers
{
    public class BaseExercisesController : Controller
    {
        private readonly AppDbContext _context;

        public BaseExercisesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: BaseExercises
        public async Task<IActionResult> Index()
        {
            return View(await _context.BaseExercises.ToListAsync());
        }

        // GET: BaseExercises/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var baseExercise = await _context.BaseExercises
                .FirstOrDefaultAsync(m => m.Id == id);
            if (baseExercise == null)
            {
                return NotFound();
            }

            return View(baseExercise);
        }

        // GET: BaseExercises/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: BaseExercises/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,Name,Muscles,Equipment")] BaseExercise baseExercise)
        {
            if (ModelState.IsValid)
            {
                _context.Add(baseExercise);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(baseExercise);
        }

        // GET: BaseExercises/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var baseExercise = await _context.BaseExercises.FindAsync(id);
            if (baseExercise == null)
            {
                return NotFound();
            }
            return View(baseExercise);
        }

        // POST: BaseExercises/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,Name,Muscles,Equipment")] BaseExercise baseExercise)
        {
            if (id != baseExercise.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(baseExercise);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!BaseExerciseExists(baseExercise.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            return View(baseExercise);
        }

        // GET: BaseExercises/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var baseExercise = await _context.BaseExercises
                .FirstOrDefaultAsync(m => m.Id == id);
            if (baseExercise == null)
            {
                return NotFound();
            }

            return View(baseExercise);
        }

        // POST: BaseExercises/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var baseExercise = await _context.BaseExercises.FindAsync(id);
            if (baseExercise != null)
            {
                _context.BaseExercises.Remove(baseExercise);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool BaseExerciseExists(int id)
        {
            return _context.BaseExercises.Any(e => e.Id == id);
        }
    }
}
